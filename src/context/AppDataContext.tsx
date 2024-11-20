import React, { createContext, useState, useEffect } from "react";
import { TodoType, PersonType } from "../components/Interfaces"; // Import your types
import { generateClient } from "aws-amplify/api";
import type { Schema } from "../../amplify/data/resource";

interface AppDataContextType {
  client: any;
  todos: TodoType[];
  people: PersonType[];
  allDataSynced: boolean;
}

export const AppDataContext = createContext<AppDataContextType | undefined>(
  undefined
);

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  //we get the client here so we can mock it for testing
  const client = generateClient<Schema>();

  const [todos, setTodos] = useState<Array<TodoType>>([]);
  const [isTodoSynced, setIsTodoSynced] = useState(false);

  const [people, setPeople] = useState<Array<PersonType>>([]);
  const [isPeopleSynced, setIsPeopleSynced] = useState(false);

  const [allDataSynced, setAllDataSynced] = useState(false);

  const [refreshPeople, setRefreshPeople] = useState(false);
  const [refreshTodos, setRefreshTodos] = useState(false);

  useEffect(() => {
    /*
        While data is syncing from the cloud, snapshots will contain all of 
        the items synced so far and an isSynced = false. 
        When the sync process is complete, a snapshot will be emitted with
        all the records in the local store and an isSynced = true.
        
       ---> observeQuery() DOES NOT support nested data!

       */
    const todoSubscription = client.models.Todo.observeQuery().subscribe({
      next: ({ items, isSynced }) => {
        const newTodos = convertTodoItems(items);
        setTodos([...newTodos]);
        setIsTodoSynced(isSynced);
        setRefreshPeople(true);
      },
    });
    const personSubscription = client.models.Person.observeQuery().subscribe({
      next: ({ items, isSynced }) => {
        const newPeopleList = convertPeopleItems(items);
        setPeople([...newPeopleList]);
        setIsPeopleSynced(isSynced);
        setRefreshTodos(true);
      },
    });

    function RefreshTodos(newPeople: Array<PersonType>) {
      const indexedPeople: { [key: string]: string | undefined } =
        newPeople.reduce((indexedArray: { [key: string]: string }, person) => {
          indexedArray[person.id] = person.name;
          return indexedArray;
        }, {});

      const newTodos = todos.map((item) => ({
        id: item.id,
        content: item.content,
        isDone: item.isDone,
        ownerId: "" + item.ownerId,
        ownerName: item.ownerId ? indexedPeople[item.ownerId] : "",
        assignedToId: "" + item.assignedToId,
        assignedToName: item.assignedToId
          ? indexedPeople[item.assignedToId]
          : "",
      }));
      setTodos([...newTodos]);
    }

    function RefreshPeople(newTodos: Array<TodoType>) {
      const newPeople = people.map((item) => ({
        id: item.id,
        name: item.name,
        ownedTodos: newTodos.filter((todo) => todo.ownerId === item.id),
        assignedTodos: newTodos.filter((todo) => todo.assignedToId === item.id),
      }));
      setPeople([...newPeople]);
    }

    function convertTodoItems(
      todos: Array<Schema["Todo"]["type"]>
    ): Array<TodoType> {
      const indexedPeople: { [key: string]: string | undefined } =
        people.reduce((indexedArray: { [key: string]: string }, person) => {
          indexedArray[person.id] = person.name;
          return indexedArray;
        }, {});

      return todos.map((item) => ({
        id: item.id,
        content: item.content,
        isDone: item.isDone,
        ownerId: "" + item.ownerId,
        ownerName: item.ownerId ? indexedPeople[item.ownerId] : "",
        assignedToId: "" + item.assignedToId,
        assignedToName: item.assignedToId
          ? indexedPeople[item.assignedToId]
          : "",
      }));
    }

    function convertPeopleItems(
      people: Array<Schema["Person"]["type"]>
    ): Array<PersonType> {
      return people.map((item) => ({
        id: item.id,
        name: item.name,
        ownedTodos: todos.filter((todo) => todo.ownerId === item.id),
        assignedTodos: todos.filter((todo) => todo.assignedToId === item.id),
      }));
    }

    if (isTodoSynced && isPeopleSynced) {
      if (refreshTodos) {
        RefreshTodos(people);
        setRefreshTodos(false);
      }

      if (refreshPeople) {
        RefreshPeople(todos);
        setRefreshPeople(false);
      }

      setAllDataSynced(true);
    }

    return () => {
      todoSubscription.unsubscribe();
      personSubscription.unsubscribe();
    };
  }, [isTodoSynced, isPeopleSynced]);

  return (
    <AppDataContext.Provider value={{ client, todos, people, allDataSynced }}>
      {children}
    </AppDataContext.Provider>
  );
};
