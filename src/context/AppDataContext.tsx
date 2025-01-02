import React, { createContext, useState, useEffect, useCallback } from "react";
import { TodoType, PersonType, dbTodoType, dbPersonType } from "../components/Interfaces"; // Import your types
import { generateClient } from "aws-amplify/api";
import { data, type Schema } from "../../amplify/data/resource";

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

  const [dbTodos, setDBTodos] = useState<Array<dbTodoType>>([]);
  const [todos, setTodos] = useState<Array<TodoType>>([]);
  const [isTodoSynced, setIsTodoSynced] = useState(false);

  const [dbPeople, setDBPeople] = useState<Array<dbPersonType>>([]);
  const [people, setPeople] = useState<Array<PersonType>>([]);
  const [isPeopleSynced, setIsPeopleSynced] = useState(false);

  const [allDataSynced, setAllDataSynced] = useState(false);
  const [refreshData, setRefreshData] = useState(false);

  const RefreshTodos = useCallback(
    (newPeople: Array<dbPersonType>) => {
      const indexedPeople: { [key: string]: string | undefined } =
        newPeople.reduce((indexedArray: { [key: string]: string | undefined }, person) => {
          indexedArray[person.id] = person.name;
          return indexedArray;
        }, {});

        const newTodos = dbTodos.map((item) => ({
          ...item,
          ownerId: item.ownerId ? String(item.ownerId) : "",
          assignedToId: item.assignedToId ? String(item.assignedToId) : "",
          ownerName: item.ownerId ? indexedPeople[item.ownerId] : "",
          assignedToName: item.assignedToId ? indexedPeople[item.assignedToId] : "",
        }))

      setTodos(newTodos);
  }, 
    [dbTodos]
  );

  const RefreshPeople = useCallback(
    (newTodos: Array<dbTodoType>) => {
      const newPeople = dbPeople.map((item) => ({
          ...item,
          ownedTodos: convertTodoItems(newTodos.filter((todo) => todo.ownerId === item.id)),
          assignedTodos: convertTodoItems(newTodos.filter((todo) => todo.assignedToId === item.id)),
        })
      );
      setPeople(newPeople);
  },
    [dbPeople]
  );

  function convertTodoItems(dbTodos: Array<dbTodoType>): Array<TodoType> {
      const indexedPeople: { [key: string]: string | undefined } =
        dbPeople.reduce((indexedArray: { [key: string]: string }, person) => {
          indexedArray[person.id] = person.name;
          return indexedArray;
        }, {});

      return dbTodos.map((item) => ({
        id: item.id,
        content: item.content,
        isDone: item.isDone,
        ownerId: "" + item.ownerId,
        ownerName: item.ownerId ? indexedPeople[item.ownerId] : "",
        assignedToId: "" + item.assignedToId,
        assignedToName: item.assignedToId ? indexedPeople[item.assignedToId] : "",
      }));
  }

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const { data: todoList, errors } = await client.models.Todo.list();
        if (errors) {
          console.error(errors);
        } else {
          setDBTodos(todoList);
          setIsTodoSynced(true);
          setRefreshData(true)
        }
      } catch (error) {
        console.error('Error fetching Todos:', error);
      }
    };
    fetchTodos();

    const fetchPeople = async () => {
      try {
        const { data: peopleList, errors } = await client.models.Person.list();
        if (errors) {
          console.error(errors);
        } else {
          setDBPeople(peopleList);
          setIsPeopleSynced(true);
          setRefreshData(true);
        }
      } catch (error) {
        console.error('Error fetching People:', error);
      }
    };
    fetchPeople();

    //Todo Subscriptions
    const todoCreateSub = client.models.Todo.onCreate().subscribe({
      next: (newTodo: dbTodoType) => {
        setDBTodos((prevTodos) => [...prevTodos, newTodo]);
        setIsTodoSynced(true);
        setRefreshData(true);
      },
      error: (error: any) => { console.warn('Error creating Todo:', error); },
    });
    const todoUpdateSub = client.models.Todo.onUpdate().subscribe({
      next: (updatedTodo: dbTodoType) => {
        setDBTodos((prevTodo) =>  prevTodo.map((todo) => todo.id === updatedTodo.id ? updatedTodo : todo));
        setIsTodoSynced(true);
        setRefreshData(true);
      },
      error: (error: any) => { console.warn('Error updating Todo:', error); },
    });
    const todoDeleteSub = client.models.Todo.onDelete().subscribe({
      next: (deletedTodo: dbTodoType) => {
      setDBTodos((prevTodos) => prevTodos.filter(todo => todo.id !== deletedTodo.id));
      setIsTodoSynced(true);
      setRefreshData(true);
      },
      error: (error: any) => { console.warn('Error deleting Todo:', error); },
    });    

    //People Subscriptions
    const peopleCreateSub = client.models.Person.onCreate().subscribe({
      next: (newPerson: dbPersonType) => {
        setDBPeople((prevPerson) => [...prevPerson, newPerson]);
        setIsPeopleSynced(true);
        setRefreshData(true);
      },
      error: (error: any) => { console.warn('Error creating Person:', error); },
    });
    const peopleUpdateSub = client.models.Person.onUpdate().subscribe({
      next: (updatedPerson: dbPersonType) => {
        setDBPeople((prevPeople) =>  prevPeople.map((person) => person.id === updatedPerson.id ? updatedPerson : person));
        setIsPeopleSynced(true);
        setRefreshData(true);
      },
      error: (error: any) => { console.warn('Error updating Person:', error); },
    });
    const peopleDeleteSub = client.models.Person.onDelete().subscribe({
      next: (deletedPerson: dbPersonType) => {
      setDBTodos((prevPerson) => prevPerson.filter(person => person.id !== deletedPerson.id));
      setIsPeopleSynced(true);
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
    if (isTodoSynced && isPeopleSynced) {       
      setAllDataSynced(true);     
      if (refreshData) {        
        RefreshTodos(dbPeople);
        RefreshPeople(dbTodos);
        setRefreshData(false);
      }
    }
  }, [isTodoSynced, isPeopleSynced, refreshData, dbPeople, dbTodos, RefreshTodos, RefreshPeople]);

  return (
    <AppDataContext.Provider value={{ client, todos, people, allDataSynced }}>
      {children}
    </AppDataContext.Provider>
  );
};