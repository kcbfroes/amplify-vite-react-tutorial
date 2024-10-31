import React, { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { Alert, AlertVariations, Authenticator, Badge, Button, Card, CheckboxField, Divider, Flex, Grid, Heading, Table, TableBody, TableCell, TableHead, TableRow, Text, useTheme } from '@aws-amplify/ui-react'
import Modal from "./components/Modal";
import '@aws-amplify/ui-react/styles.css'
import ListTodos from "./components/Todo/ListTodos";
import TodoTS from "./components/Todo/TodoTS"
import { GraphQLFormattedError, TodoType, PersonType } from "./components/Interfaces";
import { CONNECTION_STATE_CHANGE, ConnectionState } from 'aws-amplify/data';
import { Hub } from 'aws-amplify/utils';
import NavMenu from "./components/Main/NavMenu";

const client = generateClient<Schema>();

function App() {
  
  //data lists
  const [todos, setTodos] = useState<Array<TodoType>>([]);

  //Nav Menu
  const [currentNavItem, setCurrentNavItem] = useState('ToDos')

  //All other
  const [createOpen, setCreateOpen] = useState(false)
  const [allData, setAllData] = useState(false)
  const [alertHeading, setAlertHeading] = useState('')
  const [alertMsg, setAlertMsg] = useState('')
  const [alertVariation, setAlertVariation] = useState<AlertVariations>("info")
  const [alertVisible, setAlertVisible] = useState(false)
  const [subConnectVariation, setSubConnectVariation] = useState<AlertVariations>("info")
  const [subConnectMsg, setsubConnectMsg] = useState<ConnectionState>()

  const { tokens } = useTheme();

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
          setAllData(isSynced)
      },
    });
    return () => sub.unsubscribe();
  }, []);

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
      return (
        <Modal isOpen={createOpen}>
          <TodoTS handleOnClose={createTodo} />
        </Modal>
      )
    }else{
      return(<></>);
    }
  }
  const createTodo = (aTodo: Partial<TodoType>, cancelled:boolean) => {
    if ( !cancelled ) {
      client.models.Todo.create({ content: "" + aTodo.content, isDone: aTodo.isDone })
        .then(result => handleTodoResult(result, "Create a ToDo", aTodo))
        .catch(error => handleTodoError(error, "Create a ToDo", aTodo));
    }
    setCreateOpen(false);

  }

  //------------------------------ Edit/Update ------------------------------
  const updateTodo = (todo: TodoType) => {
    client.models.Todo.update(todo)
      .then(result => handleTodoResult(result, "Update a ToDo", todo))
      .catch(error => handleTodoError(error, "Update a ToDo: ", todo));
  }

  //------------------------------ Delete ------------------------------
  const deleteTodo = (id: string) => {
   client.models.Todo.delete({ id })
      .then(result => handleTodoDeleteResult(result, id))
      .catch(error => handleTodoDeleteError(error, id));
  }  

  //------------------------------ Handle Todo Actions ------------------------------
  const handleTodoResult = (result: any, header: string, todo: Partial<TodoType> ) => {
    setAlertMsg('')
    if (result.errors) {
      handleTodoError(result.errors, header, todo)
    }else{
      setAlertHeading(header)
      setAlertVariation("success")
      setAlertVisible(true)
      setAlertMsg("'" + todo.content + "' was successful")
    }
  }
  const handleTodoError = (errors: Array<GraphQLFormattedError>, header: string, todo: Partial<TodoType>) => {    
    var allErrors: string = ''
    setAlertHeading(header + " Unexpeceted Error")
    for (const err of errors) {
      allErrors += "'" + todo.content + "' -->" + err.message
    }
    setAlertMsg(allErrors)
    setAlertVariation("error")
    setAlertVisible(true)
  }
  
  const handleTodoDeleteResult = (result: any, todo_id: string ) => {
    setAlertMsg('')
    var theTodo: string = ''
    var todo = findTodoById(todo_id);
    if (todo) {
      theTodo = todo.content
    }else{
      theTodo = "{ID '" + todo_id + "' was not found}"
    }

    if (result.errors) {
      handleTodoDeleteError(result.errors, theTodo)
    }else{
      setAlertHeading("Delete Todo")
      setAlertVariation("success")
      setAlertVisible(true)
      setAlertMsg("'" + theTodo + "' was successful")
    }
  }
  const handleTodoDeleteError = (errors: Array<GraphQLFormattedError>, theTodo: string ) => {
    var allErrors: string = ""
    setAlertHeading("Unexpeceted Error trying to delete Todo: '" + theTodo + "'")
    for (const err of errors) {
      allErrors += err.message
    }
    setAlertMsg(allErrors)
    setAlertVariation("error")
    setAlertVisible(true)
  }

   //------------------------------ Optional UI Items ------------------------------
  const navigationMenu = () => {
    return (
      <NavMenu currentItem={currentNavItem} onSelectItem={onSelectNavItem}></NavMenu>
    )
  }

  const onSelectNavItem = (navItemName: string) => {
    setCurrentNavItem(navItemName)
  }

  const mainContent = () => {
    if (currentNavItem == "ToDos") {
      return (<ListTodos todoList={todos} onDelete={deleteTodo} onUpdate={updateTodo}/>)
    }else if (currentNavItem == "People") {
      return (<div>People List here</div>)
    }else{
      return (<div>I do not understand the Current Nav menu item: {currentNavItem}</div>)
    }
  }
  
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

  const findTodoById = (id: string) => { return todos.find(todo => todo.id == id) }

  //------------------------------ UI ------------------------------
  return (        
    <Authenticator>
      {({ signOut, user }) => (
        <React.Fragment>
          <main>
            <Heading fontWeight={"bold"} level={1} >
              <Flex direction="row" gap="5rem" padding="10x" >
                
                {user?.signInDetails?.loginId}'s todos
                
                <Button 
                  onClick={signOut}
                  size="large"
                  variation="primary"
                >
                  Sign out
                </Button>

                <Badge size="large" variation={subConnectVariation} >
                  {subConnectMsg}
                </Badge>
              </Flex>
            </Heading>
            
            <Divider size="large" orientation="horizontal" padding="1rem" color="black"/>

            <Grid
              gap={tokens.space.small}
              rowGap={tokens.space.small}
              templateColumns="1fr 4fr"
              templateRows="4fr 1fr"
              paddingBottom="1rem"
            >
              <Card columnStart="1" >
                {navigationMenu()}
              </Card>
              <Card columnStart="2" >
                {mainContent()}
              </Card>
              <Card columnStart="1" columnEnd="-1">
                {showDataLoading() }
              </Card>
            </Grid>

            <Flex direction="row" wrap="nowrap" gap="1rem" backgroundColor='green.20' padding='10px'>
              <button onClick={() => {setCreateOpen(true)}}>Create Todo</button>
            </Flex>

            {newTodo()}

            
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
