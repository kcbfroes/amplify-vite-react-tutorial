import React, { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { Alert, AlertVariations, Authenticator, Badge, CheckboxField, Flex, Heading, Text } from '@aws-amplify/ui-react'
import Modal from "./components/Modal";
import '@aws-amplify/ui-react/styles.css'
import ListTodos from "./components/ListTodos";
import TodoTS from "./components/TodoTS"
import { emptyToDo, GraphQLFormattedError } from "./components/Interfaces";
import { CONNECTION_STATE_CHANGE, ConnectionState } from 'aws-amplify/data';
import { Hub } from 'aws-amplify/utils';

const client = generateClient<Schema>();

function App() {
  
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const [createOpen, setCreateOpen] = useState(false)
  const [allData, setAllData] = useState(false)
  const [withError, setWithError] = useState(false)
  const [alertHeading, setAlertHeading] = useState('')
  const [alertMsg, setAlertMsg] = useState('')
  const [alertVariation, setAlertVariation] = useState<AlertVariations>("info")
  const [alertVisible, setAlertVisible] = useState(false)
  const [subConnectVariation, setSubConnectVariation] = useState<AlertVariations>("info")
  const [subConnectMsg, setsubConnectMsg] = useState<ConnectionState>()

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
          console.log("In App, useEffect refreshed Todos: ", items)          
          console.log("In App, useEffect isSynced: ", isSynced)
          setAllData(isSynced)
      },
    });
    return () => sub.unsubscribe();
  }, []);

  const resetTodo = () => {
    emptyToDo.content = ''
    emptyToDo.isDone = false
  }

  //------------------------------ Monitor Subscription Connection Status ------------------------------
  Hub.listen('api', (data: any) => {
    const { payload } = data;
    if (payload.event === CONNECTION_STATE_CHANGE) {
      const connectionState = payload.data.connectionState as ConnectionState;
      //console.log(connectionState)
      setsubConnectMsg(connectionState)
      if (connectionState == "Connecting") {
        setSubConnectVariation("info")
      }else if (connectionState == "Connected") {
        setSubConnectVariation("success")
      }else{
        setSubConnectVariation("error")
        //also show an alert error message.
        setAlertHeading("Backend Connection Lost")
        setAlertMsg("The connection to the backend has been interupted. We'll keep trying to connect so no action is required on your parth")
        setAlertVariation("error")
      }
    }
  });

  //------------------------------ Create ------------------------------
  const newTodo = () => {
    if (createOpen) {
      resetTodo()
      console.log("App, newTodo, emptyToDo: ", emptyToDo)
      return (
        <Modal isOpen={createOpen}>
          <TodoTS todo={emptyToDo} handleOnClose={createTodo} />
        </Modal>
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
          .then(result => handleTodoResult(result, aTodo, "Create a ToDo: " + aTodo.content))
          .catch(error => handleTodoError(error, aTodo, "Create a ToDo: " + aTodo.content));
      }else{  
        //this call will generate a runtime error, which should be shown on the screen.   
        client.models.Todo.create(aTodo)
          .then(result => handleTodoResult(result, aTodo, "Create a ToDo: " + aTodo.content))
          .catch(error => handleTodoError(error, aTodo, "Create a ToDo: " + aTodo.content));
      }
    }
    setCreateOpen(false);
    setWithError(false)

  }

  //------------------------------ Edit/Update ------------------------------
  const updateTodo = (todo: Schema["Todo"]["type"]) => {
    console.log("In App, editTodo, update: ", todo)
    client.models.Todo.update(todo)
      .then(result => handleTodoResult(result, todo, "Create a ToDo: " + todo.content))
      .catch(error => handleTodoError(error, todo, "Create a ToDo: " + todo.content));
  }

  //------------------------------ Delete ------------------------------
  const deleteTodo = (id: string) => {
    console.log("In App, deleteTodo with id: ", id)
    client.models.Todo.delete({ id })
      .then(result => handleTodoDeleteResult(result, id, "Deleting a ToDo"))
      .catch(error => handleTodoDeleteError(error, id, "Deleting a ToDo"));
  }  

  //------------------------------ Handle Todo Actions ------------------------------
  const handleTodoResult = (result: any, todo: Schema["Todo"]["type"], what: string ) => {
    setAlertMsg('')
    console.log("App, handleResult, result: ", result)
    if (result.errors) {
      handleTodoError(result.errors, todo, what)
    }else{
      setAlertHeading(what)
      setAlertVariation("success")
      setAlertVisible(true)
      setAlertMsg(what + " was successful")
    }
  }
  const handleTodoError = (errors: Array<GraphQLFormattedError>, todo: Schema["Todo"]["type"], what: string ) => {    
    var allErrors: string = ''
    setAlertHeading("Unexpeceted Error")
    for (const err of errors) {
      allErrors += err.message + " (" + what + ")"
    }
    setAlertMsg(allErrors)
    setAlertVariation("error")
    setAlertVisible(true)
  }
  
  const handleTodoDeleteResult = (result: any, todo_id: string, what: string ) => {
    setAlertMsg('')
    if (result.errors) {
      handleTodoDeleteError(result.errors, todo_id, what)
    }else{
      setAlertHeading(what)
      setAlertVariation("success")
      setAlertVisible(true)
      setAlertMsg(what + " was successful")
    }
  }
  const handleTodoDeleteError = (errors: Array<GraphQLFormattedError>, todo_id: string, what: string ) => {    
    var allErrors: string = ''
    setAlertHeading("Unexpeceted Error " + what)
    for (const err of errors) {
      allErrors += err.message
    }
    setAlertMsg(allErrors)
    setAlertVariation("error")
    setAlertVisible(true)
  }

   //------------------------------ Optional UI Items ------------------------------
  const showDataLoading = () => {
    if (allData == true) {
      return(<Text variation="success">All data is loaded</Text>)
    }else{
      return(<Text variation="info">data is loading...</Text>)
    }    
  }

  const showAlerts = () => {
    if (alertMsg.length > 0) {
      return(
        <Alert 
          variation={alertVariation} 
          isDismissible={true} 
          hasIcon={true} 
          heading={alertHeading}
          onDismiss={() => setAlertVisible(false)}
        >
          {alertMsg}
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
            
            <Flex direction="row" wrap="nowrap" gap="1rem" backgroundColor='green.20' padding='10px'>
              <button onClick={() => {setCreateOpen(true)}}>Create Todo</button>

              <CheckboxField  
                label='with Error?'
                name='withError'
                value={withError ? "Yes" : "No"}
                checked={withError ? true : false}
                onChange={() => setWithError(true)} 
              />

              <Badge size="large" variation={subConnectVariation}>
                {subConnectMsg}
              </Badge>
            </Flex>

            {newTodo()}

            <ListTodos todoList={todos} onDelete={deleteTodo} onUpdate={updateTodo}/>

            {showDataLoading() }

            <button onClick={signOut}>Sign out</button>

          </main>
        <div>
          {showAlerts()}
        </div>
        </React.Fragment>
      )}
    </Authenticator>
  );
}

export default App;
