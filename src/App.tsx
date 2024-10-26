import React, { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { Alert, Authenticator, CheckboxField, Flex, Heading, Text } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import ListTodos from "./components/ListTodos";
import TodoTS from "./components/TodoTS"
import { emptyToDo, GraphQLFormattedError } from "./components/Interfaces";

const client = generateClient<Schema>();

function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const [createOpen, setCreateOpen] = useState(false)
  const [allData, setAllData] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [withError, setWithError] = useState(false)

  useEffect(() => {
    /*
      While data is syncing from the cloud, snapshots will contain all of 
      the items synced so far and an isSynced = false. 
      When the sync process is complete, a snapshot will be emitted with
      all the records in the local store and an isSynced = true.
    */
    const sub =client.models.Todo.observeQuery().subscribe({
      next: ({ items, isSynced }) => {
          setTodos([...items])
          console.log("In App, useEffect refreshed Todos: ", todos)          
          console.log("In App, useEffect isSynced: ", isSynced)
          setAllData(isSynced)
      },
    });
    return () => sub.unsubscribe();
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

      if (withError == false) {
        client.models.Todo.create({  content:aTodo.content, isDone:aTodo.isDone})
          .then(result => handleResult(result, "Todo Create"))
          .catch(error => handleError(error, "Todo Create"));
      }else{  
        //this call will generate a runtime error, which should be shown on the screen.   
        client.models.Todo.create(aTodo)
          .then(result => handleResult(result, "Todo Create"))
          .catch(error => handleError(error, "Todo Create"));
      }
    }
    setCreateOpen(false);
    setWithError(false)
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

  //------------------------------ Handle Todo Errors ------------------------------
  const handleResult = (result: any, where: string ) => {
    setErrorMessage('')
    console.log("App, handleResult, result: ", result)
    if (result.errors) handleError(result.errors, where)    
  }
  const handleError = (errors: Array<GraphQLFormattedError>, where: string ) => {    
    var allErrors: string = ''
    for (const err of errors) {
      allErrors += err.message + " (" + where + ")"
    }
    console.log("App, handleError, allErrors: ", allErrors)
    setErrorMessage(allErrors)
  }

   //------------------------------ Optional UI Items ------------------------------
  const showDataLoading = () => {
    if (allData == true) {
      return(<Text variation="success">All data is loaded</Text>)
    }else{
      return(<Text variation="info">data is loading...</Text>)
    }    
  }

  const showErrors = () => {
    if (errorMessage.length > 0) {
      return(
        <Alert isDismissible={true} hasIcon={true} heading="Application Error">
          {errorMessage}
        </Alert>
      )
    }else{
      return(<></>)
    }    
  }

  //------------------------------ UI ------------------------------
  return (        
    <Authenticator>
      {({ signOut, user }) => (
        <React.Fragment>
          <main>
            <Heading fontWeight={"bold"} level={1} >
              {user?.signInDetails?.loginId}'s todos
            </Heading>
            
            <Flex direction="row" wrap="nowrap" gap="1rem">
              <button onClick={() => {setCreateOpen(true)}}>Create Todo</button>

              <CheckboxField                
                label='with Error?'
                name='withError'
                value={withError ? "Yes" : "No"}
                checked={withError ? true : false}
                onChange={() => setWithError(true)} 
              />
            </Flex>            

            <ListTodos todoList={todos} onDelete={deleteTodo} onUpdate={updateTodo}/>

            {showDataLoading() }

            <button onClick={signOut}>Sign out</button>

          </main>
          {newTodo()}
        <div>
          {showErrors()}
        </div>
        </React.Fragment>
      )}
    </Authenticator>
  );
}

export default App;
