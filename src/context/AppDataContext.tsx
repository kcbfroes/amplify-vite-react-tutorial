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
        /*
        While data is syncing from the cloud, snapshots will contain all of 
        the items synced so far and an isSynced = false. 
        When the sync process is complete, a snapshot will be emitted with
        all the records in the local store and an isSynced = true.
        */
        const todoSubscription =client.models.Todo.observeQuery().subscribe({
            next: ({ items, isSynced }) => {
                setTodos([...items])
                setIsTodoSynced(isSynced)
                console.log("Refreshed Todos: ", todos)
            },
        });

        const personSubscription = client.models.Person.observeQuery().subscribe({
            next: ({ items, isSynced }) => {
                setPeople([...items]);
                setIsPeopleSynced(isSynced);
            },
        });

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
