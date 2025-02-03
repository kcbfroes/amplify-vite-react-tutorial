import React, { useContext, useState } from "react";
import {
  AlertVariations,
  Authenticator,
  Badge,
  Button,
  Card,
  Divider,
  Flex,
  Grid,
  Heading,
  Text,
  useTheme,
} from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import ListTodos from "./components/Todo/ListTodos";
import { CONNECTION_STATE_CHANGE, ConnectionState } from "aws-amplify/data";
import { Hub } from "aws-amplify/utils";
import NavMenu from "./components/Main/NavMenu";
import PersonList from "./components/Person/PersonList";
import { AppDataContext } from "./context/AppDataContext";

function App() {

  //Navigation
  const [currentNavItem, setCurrentNavItem] = useState("ToDos");

  //Subscription Status
  const [subConnectVariation, setSubConnectVariation] =
    useState<AlertVariations>("info");
  const [subConnectMsg, setsubConnectMsg] = useState<ConnectionState>();

  const { tokens } = useTheme();

  //------------------------------ Monitor Subscription Connection Status ------------------------------
  Hub.listen("api", (data: any) => {
    const { payload } = data;
    if (payload.event === CONNECTION_STATE_CHANGE) {
      const connectionState = payload.data.connectionState as ConnectionState;
      //console.log(connectionState)
      setsubConnectMsg(connectionState);
      if (connectionState == "Connecting") {
        setSubConnectVariation("info");
      } else if (connectionState == "Connected") {
        setSubConnectVariation("success");
      } else {
        setSubConnectVariation("error");
      }
    }
  });

  //------------------------------ UI Items ------------------------------
  const navigationMenu = () => {
    return (
      <NavMenu
        currentItem={currentNavItem}
        onSelectItem={onSelectNavItem}
      ></NavMenu>
    );
  };

  const onSelectNavItem = (navItemName: string) => {
    setCurrentNavItem(navItemName);
  };

  const mainContent = () => {
    if (currentNavItem == "ToDos") {
      return <ListTodos />;
    } else if (currentNavItem == "People") {
      return <PersonList />;
    } else {
      return (
        <div>
          I do not understand the Current Nav menu item: {currentNavItem}
        </div>
      );
    }
  };

  //------------------------------ UI ------------------------------
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <React.Fragment>
          <main>
            <Heading fontWeight={"bold"} level={1}>
              <Flex direction="row" gap="5rem" padding="10x">
                {user?.signInDetails?.loginId}'s todos
                <Button
                  onClick={signOut}
                  size="large"
                  variation="link"
                  color={tokens.colors.black}
                >
                  Sign out
                </Button>
                <Badge size="large" variation={subConnectVariation}>
                  {subConnectMsg}
                </Badge>
              </Flex>
            </Heading>

            <Divider
              size="large"
              orientation="horizontal"
              padding="1rem"
              color="black"
            />

            <Grid
              gap={tokens.space.small}
              rowGap={tokens.space.small}
              templateColumns="1fr 6fr"
              templateRows="6fr .5fr"
              paddingBottom="1rem"
            >
              <Card columnStart="1">{navigationMenu()}</Card>
              <Card columnStart="2">{mainContent()}</Card>
              <Card columnStart="1" columnEnd="-1"></Card>
            </Grid>
          </main>
        </React.Fragment>
      )}
    </Authenticator>
  );
}

export default App;
