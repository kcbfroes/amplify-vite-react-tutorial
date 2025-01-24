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
    console.log("AppContext: Todos useEffect:", todos);
  }, [todos]);
  useEffect(() => {
    console.log("AppContext: People useEffect:", people);
  }, [people]);
  useEffect(() => {    
    if (setUpSubs) {
      console.log("AppContext: Time to useEffect");
      SetUpSubs();  
    }
  }, [setUpSubs]);

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

    //DEFINE a function to get data from the DB, then convert to something the app can use
    const initializeData = async () => {
      console.log("AppContext: Fetching Data");
      await fetchPeople();
      console.log("AppContext: People Fetched");
      await fetchTodos();
      console.log("AppContext: Todos Fetched");
      ConvertToAppData();
    };

    //Actually CALL the function to get the data and convert it
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
        console.log("AppContext: todoCreateSub fired");
        pointNewTodo(newTodo);
      },
      error: (error: any) => { console.warn('useEffect2: Error creating Todo:', error); },
    });
    const todoUpdateSub = client.models.Todo.onUpdate().subscribe({
      next: (updatedTodo: dbTodoType) => {
        console.log("AppContext: todoUpdateSub fired");
        pointUpdateTodo(updatedTodo);
      },
      error: (error: any) => { console.warn('useEffect2: Error updating Todo:', error); },
    });
    const todoDeleteSub = client.models.Todo.onDelete().subscribe({
      next: (deletedTodo: dbTodoType) => {
        console.log("AppContext: todoDeleteSub fired");
        pointDeleteTodo(deletedTodo);
      },
      error: (error: any) => { console.warn('useEffect2: Error deleting Todo:', error); },
    });    

    //People Subscriptions
    const peopleCreateSub = client.models.Person.onCreate().subscribe({
      next: (newPerson: dbPersonType) => {
        console.log("AppContext: peopleCreateSub fired");
      },
      error: (error: any) => { console.warn('useEffect2: Error creating Person:', error); },
    });
    const peopleUpdateSub = client.models.Person.onUpdate().subscribe({
      next: (updatedPerson: dbPersonType) => {
        console.log("AppContext: peopleUpdateSub fired");
      },
      error: (error: any) => { console.warn('useEffect2: Error updating Person:', error); },
    });
    const peopleDeleteSub = client.models.Person.onDelete().subscribe({
      next: (deletedPerson: dbPersonType) => {
        console.log("AppContext: peopleDeleteSub fired");
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

  const pointNewTodo = useCallback((newTodo: dbTodoType) => {
    
    const indexedPeople: { [key: string]: string | undefined } =
        people.reduce((indexedArray: { [key: string]: string }, person) => {
          indexedArray[person.id] = person.name;
          return indexedArray;
        }, {});

    const appTodo: TodoType = {
      ...newTodo,

      ownerId: newTodo.ownerId ?? "",
      ownerName: newTodo.ownerId ? indexedPeople[newTodo.ownerId] : "",

      assignedToId: newTodo.assignedToId ?? "",
      assignedToName: newTodo.assignedToId ? indexedPeople[newTodo.assignedToId] : "",
    }

    setTodos((prevTodos) => [...prevTodos, appTodo]);

    if (newTodo.ownerId) {
      const owner = people.find(person => person.id === newTodo.ownerId);
      owner?.ownedTodos.push(appTodo);
    }

    if (newTodo.assignedToId) {
      const assigned = people.find(person => person.id === newTodo.assignedToId);
      assigned?.assignedTodos.push(appTodo);
    }

  }, [people, todos]);

  const pointUpdateTodo = (updatedTodo: dbTodoType) => {    
    //get the app todo that needs updating
    //const appTodo = todos.find((todo) => todo.id === updatedTodo.id);
    //See the OneNote page: "Understanding the Functional Form of useState" for why we use the "callback form" of setTodos
    setTodos((currTodos) => {
      const appTodo = currTodos.find((todo) => todo.id === updatedTodo.id);
      if (!appTodo) {
        console.warn(`Todo with id ${updatedTodo.id} not found`);
        return currTodos; // Return the current state unchanged
      };
    
      console.log(
        "AppContext: pointUpdateTodo. appTodo. ownerId: %s (%s), assigned: %s (%s)",
        appTodo.ownerId?.substring(0, 3),
        appTodo.ownerName,
        appTodo.assignedToId?.substring(0, 3),
        appTodo.assignedToName,
      );
      //if the owner/assignedTo changed, the new Id will be in newOwnerId/newAssignedToId of the app todo
      const ownerChanged = appTodo.ownerId !== updatedTodo.ownerId;
      const assignedChanged = appTodo.assignedToId !== updatedTodo.assignedToId;
      var newOwnerName = appTodo.ownerName;
      var newAssignedName = appTodo.assignedToName;
      
      console.log(
        "AppContext: pointUpdateTodo. currOwnerId: %s, newOwnerId: %s. currAssigned: %s, newAssigned: %s",
        appTodo.ownerId?.substring(0, 3),
        updatedTodo.ownerId?.substring(0, 3),
        appTodo.assignedToId?.substring(0, 3),
        updatedTodo.assignedToId?.substring(0, 3)
      );

      /*
        Did the ownerId change? If so, we need to update:
          The ownerName of the Todo
          The new person's owned todos list
          The old person's owned todos list
      */
      if (ownerChanged) {
              
        const oldOwner = people.find((person) => person.id === appTodo.ownerId);
        const newOwner = people.find((person) => person.id === updatedTodo.ownerId);

        if (oldOwner) {
          oldOwner.ownedTodos = oldOwner.ownedTodos.filter((todo) => todo.id !== updatedTodo.id);
        }
        if (newOwner) {
          newOwner.ownedTodos = [...(newOwner.ownedTodos || []), appTodo];
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
        const oldAssigned = people.find((person) => person.id === appTodo.assignedToId);
        const newAssigned = people.find((person) => person.id === updatedTodo.assignedToId);

        if (oldAssigned) {
          oldAssigned.assignedTodos = oldAssigned.assignedTodos.filter((todo) => todo.id !== updatedTodo.id);
        }
        if (newAssigned) {
          newAssigned.assignedTodos = [...(newAssigned.assignedTodos || []), appTodo];
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
      
      console.log(
        "AppContext: pointUpdateTodo. UpdatedTodo. ownerId: %s (%s), assigned: %s (%s)",
        newTodo.ownerId?.substring(0, 3),
        newTodo.ownerName,
        newTodo.assignedToId?.substring(0, 3),
        newTodo.assignedToName,
      );
      
      return currTodos.map((todo) =>
        todo.id === updatedTodo.id ? newTodo : todo
      );
    });        
  };

  const pointDeleteTodo = useCallback((deletedTodo: dbTodoType) => {        
    
    const owner = people.find(person => person.id === deletedTodo.ownerId);
    const assigned = people.find(person => person.id === deletedTodo.assignedToId);

    if (owner) owner.ownedTodos = owner.ownedTodos.filter(todo => todo.id !== deletedTodo.id);
    if (assigned) assigned.assignedTodos = assigned.assignedTodos.filter(todo => todo.id !== deletedTodo.id);

  }, [people]);

  return (
    <AppDataContext.Provider value={{ client, todos, people}}>
      {children}
    </AppDataContext.Provider>
  );
};