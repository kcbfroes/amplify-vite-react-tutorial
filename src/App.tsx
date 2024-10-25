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
    client.models.Todo.observeQuery().subscribe({
      next: (data) => {
          setTodos([...data.items])
          console.log("In App, useEffect New Todo: ", todos)
      },
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
      console.log("In App, Creating a Todo: ", aTodo)

      client.models.Todo.create({ content:aTodo.content, isDone:aTodo.isDone})
        .then(result => console.log("In App, Create successful", result))
        .catch(error => console.log("In App, Error creating todo: ", error));

    }
    setCreateOpen(false);
  }

  //------------------------------ Edit/Update ------------------------------
  const updateTodo = (todo: Schema["Todo"]["type"]) => {
    console.log("In App, editTodo, update: ", todo)
    client.models.Todo.update(todo)
  }

  //------------------------------ Delete ------------------------------
  const deleteTodo = (id: string) => {
    console.log("In App, deleteTodo with id: ", id)
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
