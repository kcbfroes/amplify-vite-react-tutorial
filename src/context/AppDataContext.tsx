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

        const indexedPeople: { [key: string]: string | undefined } = people.reduce((indexedArray: { [key: string]: string }, person) => {
            indexedArray[person.id] = person.name;
            return indexedArray;
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
                const newTodos = convertTodoItems(items)
                setTodos(...[newTodos])
                setIsTodoSynced(isSynced)
                RefreshPeople()
            },
        });

        const personSubscription = client.models.Person.observeQuery().subscribe({
            next: ({ items, isSynced }) => {
                const newPeopleList = convertPeopleItems(items)
                setPeople(...[newPeopleList]);
                setIsPeopleSynced(isSynced);
            },
        });

        function RefreshPeople() {
           console.log("Refresh People")
            const newPeople = people.map((item) => (
                {
                    id: item.id,
                    name: item.name,
                    ownedTodos: getOwnedTodos(item.id),
                    assignedTodos: getAssignedTodos(item.id)
                }
            ))
            setPeople(...[newPeople])
        }
        
        function convertTodoItems(todos: Array<Schema["Todo"]["type"]>): Array<TodoType> {
            return (
                todos.map((item) => (
                    {
                        id: item.id,
                        content: item.content,
                        isDone: item.isDone,
                        ownerId: '' + item.ownerId,
                        ownerName: item.ownerId ? indexedPeople[item.ownerId] : '',
                        assignedToId: '' + item.assignedToId,
                        assignedToName: item.assignedToId ? indexedPeople[item.assignedToId] : ''
                    }
                ))
            )
        }

        function getOwnedTodos(personId: string) {
            return todos.filter(todo => todo.ownerId === personId) 
        }
        function getAssignedTodos(personId: string) {
            return todos.filter(todo => todo.assignedToId === personId)
        }
        function convertPeopleItems(person: Array<Schema["Person"]["type"]>): Array<PersonType> {
            return (
                person.map((item) => (
                    {
                        id: item.id,
                        name: item.name,
                        ownedTodos: getOwnedTodos(item.id),
                        assignedTodos: getAssignedTodos(item.id)
                    }
                ))
            )
        }

        if (isTodoSynced && isPeopleSynced) {
            setAllDataSynced(true);
        }

        return () => {
            todoSubscription.unsubscribe();
            personSubscription.unsubscribe();
        };

    }, [isTodoSynced, isPeopleSynced]);

    return (
        <AppDataContext.Provider value={{ client, todos, people, setTodos, setPeople, allDataSynced }}>
        {children}
        </AppDataContext.Provider>
    );
};
