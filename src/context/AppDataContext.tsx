import React, { createContext, useState, useEffect, useCallback } from "react";
import { TodoType, PersonType, dbTodoType, dbPersonType } from "../components/Interfaces"; // Import your types
import { generateClient } from "aws-amplify/api";
import { type Schema } from "../../amplify/data/resource";

interface AppDataContextType {
  client: any;
  todos: TodoType[];
  people: PersonType[];
}

export const AppDataContext = createContext<AppDataContextType | undefined>(
  undefined
);

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  //we get the client here so we can mock it for testing
  const client = generateClient<Schema>();

  const [dbTodos, setDBTodos] = useState<Array<dbTodoType>>([]);
  const [todos, setTodos] = useState<Array<TodoType>>([]);

  const [dbPeople, setDBPeople] = useState<Array<dbPersonType>>([]);
  const [people, setPeople] = useState<Array<PersonType>>([]);

  const [refreshData, setRefreshData] = useState(false);

  useEffect(() => {

    const fetchTodos = async () => {
      const { data: todoList, errors }: { data: dbTodoType[], errors?: any } = await client.models.Todo.list();
      if (errors) {
        console.error(errors);
      } else {
        setDBTodos(todoList);
        setRefreshData(true)
      }
    };

    const fetchPeople = async () => {
      const { data: peopleList, errors }: { data: dbPersonType[], errors?: any } = await client.models.Person.list();
      if (errors) {
        console.error(errors);
      } else {
        setDBPeople(peopleList);
        setRefreshData(true);
      }
    };

    fetchPeople().then(fetchTodos);

    //Todo Subscriptions
    const todoCreateSub = client.models.Todo.onCreate().subscribe({
      next: (newTodo: dbTodoType) => {
        setDBTodos((prevTodos) => [...prevTodos, newTodo]);
        setRefreshData(true);
      },
      error: (error: any) => { console.warn('Error creating Todo:', error); },
    });
    const todoUpdateSub = client.models.Todo.onUpdate().subscribe({
      next: (updatedTodo: dbTodoType) => {
        setDBTodos((prevTodo) =>  prevTodo.map((todo) => todo.id === updatedTodo.id ? updatedTodo : todo));
        setRefreshData(true);
      },
      error: (error: any) => { console.warn('Error updating Todo:', error); },
    });
    const todoDeleteSub = client.models.Todo.onDelete().subscribe({
      next: (deletedTodo: dbTodoType) => {
      setDBTodos((prevTodos) => prevTodos.filter(todo => todo.id !== deletedTodo.id));
      setRefreshData(true);
      },
      error: (error: any) => { console.warn('Error deleting Todo:', error); },
    });    

    //People Subscriptions
    const peopleCreateSub = client.models.Person.onCreate().subscribe({
      next: (newPerson: dbPersonType) => {
        setDBPeople((prevPerson) => [...prevPerson, newPerson]);
        setRefreshData(true);
      },
      error: (error: any) => { console.warn('Error creating Person:', error); },
    });
    const peopleUpdateSub = client.models.Person.onUpdate().subscribe({
      next: (updatedPerson: dbPersonType) => {
        setDBPeople((prevPeople) =>  prevPeople.map((person) => person.id === updatedPerson.id ? updatedPerson : person));
        setRefreshData(true);
      },
      error: (error: any) => { console.warn('Error updating Person:', error); },
    });
    const peopleDeleteSub = client.models.Person.onDelete().subscribe({
      next: (deletedPerson: dbPersonType) => {
      setDBTodos((prevPerson) => prevPerson.filter(person => person.id !== deletedPerson.id));
      setRefreshData(true);
      },
      error: (error: any) => { console.warn('Error deleting Person:', error); },
    });

    return () => {
      todoCreateSub.unsubscribe();
      todoUpdateSub.unsubscribe();
      todoDeleteSub.unsubscribe();

      peopleCreateSub.unsubscribe();
      peopleUpdateSub.unsubscribe();
      peopleDeleteSub.unsubscribe();
    };
    
  }, []);

  useEffect(() => {      
      if (refreshData) {

        const indexedPeople: { [key: string]: string | undefined } =
          dbPeople.reduce((indexedArray: { [key: string]: string }, person) => {
            indexedArray[person.id] = person.name;
            return indexedArray;
          }, {});

        //RefreshTodos(indexedPeople);
        const newTodos = dbTodos.map((item) => ({
          ...item,
          ownerId: item.ownerId ? String(item.ownerId) : "",
          assignedToId: item.assignedToId ? String(item.assignedToId) : "",
          ownerName: item.ownerId ? indexedPeople[item.ownerId] : "",
          assignedToName: item.assignedToId ? indexedPeople[item.assignedToId] : "",
        }));
        setTodos(newTodos);
        
        //RefreshPeople(newTodos);
        const newPeople = dbPeople.map((item) => ({
          ...item,
          ownedTodos: newTodos.filter((todo) => todo.ownerId === item.id),
          assignedTodos: newTodos.filter((todo) => todo.assignedToId === item.id),
        }));
        setPeople(newPeople);

        setRefreshData(false);
      }
  }, [refreshData, dbPeople, dbTodos]);

  return (
    <AppDataContext.Provider value={{ client, todos, people}}>
      {children}
    </AppDataContext.Provider>
  );
};