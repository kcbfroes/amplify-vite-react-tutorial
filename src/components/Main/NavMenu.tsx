import { Button, Flex } from "@aws-amplify/ui-react";
import { NavigationProps } from "../Interfaces";

export default function ListTodos ( props: NavigationProps ) {
    return (
        <div>
            <Flex direction="column" gap="10px" padding="10x" >
                <Button 
                    onClick={() => props.onSelectItem("ToDos")}
                    variation={props.currentItem=="ToDos" ? "primary" : "link"}
                >
                    To Dos
                </Button>
                
                
                <Button 
                    onClick={() => props.onSelectItem("People")}
                    variation={props.currentItem=="People" ? "primary" : "link"}
                >
                    People
                </Button>
            </Flex>
        </div>
    )
}