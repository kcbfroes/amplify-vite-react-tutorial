import React, { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { AlertVariations, Authenticator, Badge, Button, Card, Divider, Flex, Grid, Heading, Text, useTheme } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import ListTodos from "./components/Todo/ListTodos";
import { TodoType, PersonType } from "./components/Interfaces";
import { CONNECTION_STATE_CHANGE, ConnectionState } from 'aws-amplify/data';
import { Hub } from 'aws-amplify/utils';
import NavMenu from "./components/Main/NavMenu";
import PersonList from "./components/Person/PersonList";

const client = generateClient<Schema>();

function App() {
  
  const [todos, setTodos] = useState<Array<TodoType>>([])
  const [isTodoSynced, setIsTodoSynced] = useState(false)

  const [people, setPeople] = useState<Array<PersonType>>([])
  const [isPeopleSynced, setIsPeopleSynced] = useState(false)

  const [allData, setAllData] = useState(false)

  //Navigation
  const [currentNavItem, setCurrentNavItem] = useState('ToDos')

  //Subscription Status
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
    const todoSubscription =client.models.Todo.observeQuery().subscribe({
      next: ({ items, isSynced }) => {
          setTodos([...items])
          setIsTodoSynced(isSynced)
      },
    });

    const personSubscription = client.models.Person.observeQuery().subscribe({
      next: ({ items, isSynced }) => {
          setPeople([...items]);
          setIsPeopleSynced(isSynced);
      },
    });

    return () => {
      todoSubscription.unsubscribe();
      personSubscription.unsubscribe();
    };
  }, [isTodoSynced, isPeopleSynced]);

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
      }
    }
  });

   //------------------------------ UI Items ------------------------------
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
      return (<ListTodos todoList={todos} client={client}/>)
    }else if (currentNavItem == "People") {
      return (<PersonList personList={people} client={client}/>)
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
                  variation="link"
                  color={tokens.colors.black}
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

            
          </main>
        </React.Fragment>
      )}
    </Authenticator>
  );
}

export default App;
