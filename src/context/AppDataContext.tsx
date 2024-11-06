import React, { createContext, useState, useEffect } from 'react';
import { TodoType, PersonType } from '../components/Interfaces';  // Import your types
import { generateClient } from 'aws-amplify/api';
import type { Schema } from "../../amplify/data/resource";

interface AppDataContextType {
    client: any
    todos: TodoType[]
    people: PersonType[]
    setTodos: React.Dispatch<React.SetStateAction<TodoType[]>>
    setPeople: React.Dispatch<React.SetStateAction<PersonType[]>>
    allDataSynced: boolean
}

const client = generateClient<Schema>();

export const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [todos, setTodos] = useState<Array<TodoType>>([])
    const [isTodoSynced, setIsTodoSynced] = useState(false)

    const [people, setPeople] = useState<Array<PersonType>>([])
    const [isPeopleSynced, setIsPeopleSynced] = useState(false)

    const [allDataSynced, setAllDataSynced] = useState(false)    

    useEffect(() => {

        const peopleMap: { [key: string]: string | undefined } = people.reduce((acc: { [key: string]: string }, person) => {
            acc[person.id] = person.name;
            return acc;
        }, {});

        /*
        While data is syncing from the cloud, snapshots will contain all of 
        the items synced so far and an isSynced = false. 
        When the sync process is complete, a snapshot will be emitted with
        all the records in the local store and an isSynced = true.
        
       ---> observeQuery() DOES NOT support nested data!

       */
        const todoSubscription =client.models.Todo.observeQuery().subscribe({
            next: ({ items, isSynced }) => {
                setTodos(convertTodoItems(items))
                setIsTodoSynced(isSynced)
            },
        });
        function convertTodoItems(todos: Array<Schema["Todo"]["type"]>): Array<TodoType> {
            return (
                todos.map((item) => (
                    {
                        id: item.id,
                        content: item.content,
                        isDone: item.isDone,
                        ownerId: '' + item.ownerId,
                        ownerName: item.ownerId ? peopleMap[item.ownerId] : '',
                        assignedToId: '' + item.assignedToId,
                        assignedToName: item.assignedToId ? peopleMap[item.assignedToId] : ''
                    }
                ))
            )
        }

        const personSubscription = client.models.Person.observeQuery().subscribe({
            next: ({ items, isSynced }) => {
                setPeople(convertPeopleItems(items));
                setIsPeopleSynced(isSynced);
            },
        });
        function convertPeopleItems(person: Array<Schema["Person"]["type"]>): Array<PersonType> {
            return (
                person.map((item) => (
                    {
                        id: item.id,
                        name: item.name,
                        ownedTodos: [],
                        assignedTodos: []
                    }
                ))
            )
        }

        if (isTodoSynced && isPeopleSynced) {
            getNestedData()
            setAllDataSynced(true);
        }

        return () => {
            todoSubscription.unsubscribe();
            personSubscription.unsubscribe();
        };

    }, [isTodoSynced, isPeopleSynced]);

    const getNestedData = async () => {
        try {
            /*
            We define peopleMap as an object with string keys and values that are either string or undefined 
            ({ [key: string]: string | undefined }), to account for cases where ownerId might not match any Person.id.

            acc is typed as { [key: string]: string } because it’s initialized as an empty object
            and accumulates Person.id to Person.name mappings.
            */
            const peopleMap: { [key: string]: string | undefined } = people.reduce((acc: { [key: string]: string }, person) => {
                acc[person.id] = person.name;
                return acc;
            }, {});

            /*
            When we map over todos, we add the ownerName property to each item by looking it up in peopleMap.
            If there’s no match in peopleMap, ownerName defaults to null.
            */
            const todosWithOwnerNames = todos.map((todo) => ({
                ...todo,
                owner: todo.ownerId ? peopleMap[todo.ownerId] : null
            }));

        console.log("AppDataContext, todos with owner: ", todosWithOwnerNames)

        setTodos(todosWithOwnerNames);
            } catch (error) {
                console.error('Error filling in owner names:', error);
            }
    }

    return (
        <AppDataContext.Provider value={{ client, todos, people, setTodos, setPeople, allDataSynced }}>
        {children}
        </AppDataContext.Provider>
    );
};
