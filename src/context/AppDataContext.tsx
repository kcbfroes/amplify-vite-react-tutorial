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

  const [todos, setTodos] = useState<Array<TodoType>>([]);

  const [people, setPeople] = useState<Array<PersonType>>([]);

  const [setUpSubs, setSetUpSubs] = useState(false);

  useEffect(() => {
    console.log("AppContext: Todos updated:", todos);
  }, [todos]);
  useEffect(() => {
    console.log("AppContext: People updated:", people);
  }, [people]);
  useEffect(() => {    
    if (setUpSubs) {
      console.log("AppContext: Time to setUpSubs");
      SetUpSubs();  
    }
  }, [setUpSubs]);

  const pointUpdateTodo = useCallback((updatedTodo: dbTodoType) => {        
    console.log("AppContext: pointUpdateTodo, Todos:", todos);
    
    //get the app todo that needs updating
    const appTodo = todos.find((todo) => todo.id === updatedTodo.id);
    if (!appTodo) {
      console.warn(`Todo with id ${updatedTodo.id} not found`);
      return;
    }
    //if the owner/assignedTo changed, the new Id will be in newOwnerId/newAssignedToId of the app todo
    const ownerChanged = appTodo.ownerId !== updatedTodo.ownerId;
    const assignedChanged = appTodo.assignedToId !== updatedTodo.assignedToId;
    var newOwnerName = appTodo.ownerName;
    var newAssignedName = appTodo.assignedToName;

    /*
      Did the ownerId change? If so, we need to update:
        The ownerName of the Todo
        The new person's owned todos list
        The old person's owned todos list
    */
    if (ownerChanged) {
            
      const oldOwner = people.find(person => person.id === appTodo.ownerId);
      const newOwner = people.find(person => person.id === updatedTodo.ownerId);

      if (oldOwner) {
        oldOwner.ownedTodos = oldOwner.ownedTodos.filter(todo => todo.id !== updatedTodo.id);
      }
      if (newOwner) {
        newOwner.ownedTodos.push(appTodo);
        newOwnerName = newOwner.name;
      }
    }
    /*
      Did the assignedToId change? If so, we need to update:
        The assignedToName of the Todo
        The new person's assignedTo todos list
        The old person's assignedTo todos list
    */
    if (assignedChanged) {          
        const oldAssigned = people.find(person => person.id === appTodo.assignedToId);
        const newAssigned = people.find(person => person.id === updatedTodo.assignedToId);

        if (oldAssigned) {
          oldAssigned.assignedTodos = oldAssigned.assignedTodos.filter(todo => todo.id !== updatedTodo.id);
        }
        if (newAssigned) {
          newAssigned.assignedTodos.push(appTodo);
          newAssignedName = newAssigned.name;
        }
      }
        
    //Now, update the todo        
    const newTodo: TodoType = {
      ...updatedTodo,

      ownerId: updatedTodo.ownerId ?? "",
      ownerName: newOwnerName,

      assignedToId: updatedTodo.assignedToId ?? "",
      assignedToName: newAssignedName,
    }

    setTodos((prevTodos) =>
      prevTodos.map((todo) => (todo.id === updatedTodo.id ? newTodo : todo))
    );
     
  }, [people, todos]);

  //One useEffect to rule them all
  useEffect(() => {
    
    var dbTodos: dbTodoType[];
    var dbPeople: dbPersonType[];    
    
    console.log("AppContext: MAIN useEffect");

    const fetchTodos = async () => {
      const { data: todoList, errors }: { data: dbTodoType[], errors?: any } = await client.models.Todo.list();
      if (errors) {
        console.error(errors);
      } else {
        dbTodos = todoList;
      }
    };

    const fetchPeople = async () => {
      const { data: peopleList, errors }: { data: dbPersonType[], errors?: any } = await client.models.Person.list();
      if (errors) {
        console.error(errors);
      } else {
        dbPeople = peopleList;
      }
    };

    const initializeData = async () => {
      console.log("AppContext: Fetching Data");
      await fetchPeople();
      console.log("AppContext: People Fetched");
      await fetchTodos();
      console.log("AppContext: Todos Fetched");
      ConvertToAppData();
    };

    initializeData().then(() => {
      console.log("AppContext: Data has been Initialized and Converted");
      setSetUpSubs(true); // Ensure state is updated before subscriptions
    });

    const ConvertToAppData = () => {
      //Convert data to App Types
      console.log("AppContext: ConvertToAppData");
      const indexedPeople: { [key: string]: string | undefined } =
        dbPeople.reduce((indexedArray: { [key: string]: string }, person) => {
          indexedArray[person.id] = person.name;
          return indexedArray;
        }, {});

      const newTodos = dbTodos.map((item) => ({
        ...item,
        newOwnerId: "",
        ownerId: item.ownerId ? String(item.ownerId) : "",
        newAssignedToId: "",
        assignedToId: item.assignedToId ? String(item.assignedToId) : "",
        ownerName: item.ownerId ? indexedPeople[item.ownerId] : "",
        assignedToName: item.assignedToId ? indexedPeople[item.assignedToId] : "",
      }));
      setTodos(newTodos);
      
      const newPeople = dbPeople.map((item) => ({
        ...item,
        ownedTodos: newTodos.filter((todo) => todo.ownerId === item.id),
        assignedTodos: newTodos.filter((todo) => todo.assignedToId === item.id),
      }));
      setPeople(newPeople); 
    }
  }, []);

  const SetUpSubs = useCallback(() => {
    console.log("AppContext: SETTING UP SUBSCRIPTIONS", todos, people);
    //Todo Subscriptions
    const todoCreateSub = client.models.Todo.onCreate().subscribe({
      next: (newTodo: dbTodoType) => {
        console.log("AppContext: todoCreateSub fired", newTodo);
      },
      error: (error: any) => { console.warn('useEffect2: Error creating Todo:', error); },
    });
    const todoUpdateSub = client.models.Todo.onUpdate().subscribe({
      next: (updatedTodo: dbTodoType) => {
        console.log("AppContext: todoUpdateSub fired", todoUpdateSub);
        pointUpdateTodo(updatedTodo);
      },
      error: (error: any) => { console.warn('useEffect2: Error updating Todo:', error); },
    });
    const todoDeleteSub = client.models.Todo.onDelete().subscribe({
      next: (deletedTodo: dbTodoType) => {
        console.log("AppContext: todoDeleteSub fired", deletedTodo);
      },
      error: (error: any) => { console.warn('useEffect2: Error deleting Todo:', error); },
    });    

    //People Subscriptions
    const peopleCreateSub = client.models.Person.onCreate().subscribe({
      next: (newPerson: dbPersonType) => {
        console.log("AppContext: peopleCreateSub fired", newPerson);
      },
      error: (error: any) => { console.warn('useEffect2: Error creating Person:', error); },
    });
    const peopleUpdateSub = client.models.Person.onUpdate().subscribe({
      next: (updatedPerson: dbPersonType) => {
        console.log("AppContext: peopleUpdateSub fired", updatedPerson);
      },
      error: (error: any) => { console.warn('useEffect2: Error updating Person:', error); },
    });
    const peopleDeleteSub = client.models.Person.onDelete().subscribe({
      next: (deletedPerson: dbPersonType) => {
        console.log("AppContext: peopleDeleteSub fired", deletedPerson);
      },
      error: (error: any) => { console.warn('useEffect2: Error deleting Person:', error); },
    });
  
    return () => {
      console.log("AppContext: Unsubscribing");
      todoCreateSub.unsubscribe();
      todoUpdateSub.unsubscribe();
      todoDeleteSub.unsubscribe();

      peopleCreateSub.unsubscribe();
      peopleUpdateSub.unsubscribe();
      peopleDeleteSub.unsubscribe();
    };
  }, [people, todos]);

  return (
    <AppDataContext.Provider value={{ client, todos, people}}>
      {children}
    </AppDataContext.Provider>
  );
};