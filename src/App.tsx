import React, { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { Authenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import ListTodos from "./components/ListTodos";
import TodoTS from "./components/TodoTS"
import { emptyToDo } from "./components/Interfaces";

const client = generateClient<Schema>();

function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const [createOpen, setCreateOpen] = useState(false)

  useEffect(() => {
    console.log("App, getting todo list");
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }, []);

  //------------------------------ Create ------------------------------
  const newTodo = () => {    
    if (createOpen) {
      return (
        <div>
          <TodoTS todo={emptyToDo} handleOnClose={createTodo} />
        </div>
      )
    }else{
      return(<></>);
    }
  }
  const createTodo = (aTodo: Schema["Todo"]["type"], cancelled:boolean) => {
    if ( !cancelled ) {
      console.log("Creating a Todo: ", aTodo)
      client.models.Todo.create(aTodo);
    }
    setCreateOpen(false);
  }

  //------------------------------ Edit/Update ------------------------------
  const updateTodo = (todo: Schema["Todo"]["type"]) => {
    console.log("editTodo ", todo)
    client.models.Todo.update(todo)
  }

  //------------------------------ Delete ------------------------------
  const deleteTodo = (id: string) => {
    client.models.Todo.delete({ id })
  }

  return (        
    <Authenticator>
      {({ signOut, user }) => (
        <React.Fragment>
          <main>
            <h1>{user?.signInDetails?.loginId}'s todos</h1>
            
            <h1>My todos</h1>
            
            <button onClick={() => {setCreateOpen(true)}}>+ new</button>

            <ListTodos todoList={todos} onDelete={deleteTodo} onUpdate={updateTodo}/>

            <button onClick={signOut}>Sign out</button>

          </main>
          {newTodo()}
        </React.Fragment>
      )}
    </Authenticator>
  );
}

export default App;
