import { GraphQLFormattedError, TodoType } from "../Interfaces";
import {
    Table,
    TableCell,
    TableBody,
    TableHead,
    TableRow,
    Flex,
    AlertVariations,
    Alert,
    Button,
    useTheme,
  } from '@aws-amplify/ui-react';
import TodoTS from "./TodoTS";
import { useContext, useState } from "react";
import Modal from "../Modal";
import TodoDeleteConfirm from "./TodoDeleteConfirm";
import OwnerSelect from "./OwnerSelect";
import { AppDataContext } from "../../context/AppDataContext";
  
export default function ListTodos () {
  
    const context = useContext(AppDataContext)
    if (!context) throw new Error("AppContext is not available")
    const { client, todos } = context
    
    const { tokens } = useTheme();

    //Alerts
    const [alertHeading, setAlertHeading] = useState('')
    const [alertMsg, setAlertMsg] = useState('')
    const [alertVariation, setAlertVariation] = useState<AlertVariations>("info")
    const [alertVisible, setAlertVisible] = useState(false)

    //All other
    const [todo, setTodo] = useState<TodoType>()        //useState<TodoType>() makes "todo" a type: TodoType | underfined
    const [createOpen, setCreateOpen] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
    const [selectOwnerOpen, setSelectOwnerOpen] = useState(false)

    //------------------------------ Create ------------------------------
    const newTodo = () => {
        if (createOpen) {
            return (
                <Modal>
                    <TodoTS handleOnClose={createTodo} />
                </Modal>
            )
        }else{
            return(<></>);
        }
    }
    const createTodo = (aTodo: Partial<TodoType>, cancelled:boolean) => {
        if ( !cancelled ) {
            const todoKey: string = '' + aTodo.content
            client.models.Todo.create({ content: "" + aTodo.content, isDone: aTodo.isDone })
                .then((result: any) => handleTodoResult(result, "Create a ToDo", todoKey))
                .catch((error: GraphQLFormattedError[]) => handleTodoError(error, "Create a ToDo", todoKey));
            }
            setCreateOpen(false);
    }
  
    //------------------------------ Edit/Update ------------------------------
    const editTodo = (todo: TodoType) => {
        setTodo(todo)
        setEditOpen(true)
    }
    const editTodoClose = (changedTodo:Partial<TodoType>, cancelled: boolean) => {
        setEditOpen(false)
        setSelectOwnerOpen(false)
        if (cancelled == false) {
            const mergedTodo: TodoType = Object.assign({}, todo, changedTodo)
            console.log("You changed the Todo. I'm about to call 'updateTodo' with: ", mergedTodo)
            updateTodo(mergedTodo)
        }
    }
    const updateTodo = async (todo: TodoType) => {
        const todoKey: string = todo.content

        //Version 4: this does not work
        /*
        try {
            const result = await client.models.Todo.update({ ...todo });
            handleTodoResult(result, "Update a ToDo", todoKey);
            console.log("'client.models.Todo.update' was successful. It returned this result: ", result)
        } catch (error) {
            handleTodoError(error as GraphQLFormattedError[], "Update a ToDo: ", todoKey);
        }*/

        //Version 3: this does not work
        /*
        const updatedTodo = await client.models.Todo.update({
            ...todo,
            id: todo.id,  // Ensure the correct item is targeted by its unique identifier.
        }).catch((error: GraphQLFormattedError[]) => handleTodoError(error, "Update a ToDo: ", todoKey));
    
        if (updatedTodo) {
            console.log("'client.models.Todo.update' success! updatedTodo is: ", updatedTodo)
            handleTodoResult(updatedTodo, "Update a ToDo", todoKey);
        }*/        
        
        //Version 2: this works but you'll have to update this code whenever the schema changes.
        //However, note that while ownerId is updated, ownerName
        await client.models.Todo.update(
            {
            id: todo.id,
            content: todo.content,
            isDone: todo.isDone,
            ownerId: todo.ownerId,
            assignedToId: todo.assignedToId
            }
        )
        .then((result: any) => handleTodoResult(result, "Update a ToDo", todoKey))
        .catch((error: any) => handleTodoError(error, "Update a ToDo", todoKey));
                
        //Why won't this update ownerId? The todo passed in has ownerId valued, and this command runs successfully, but,
        //the todo object it returns does NOT have a value for ownerId (see console.log in handleTodoResult below)
        /* Version 1: this does not work.
        client.models.Todo.update(todo)
            .then((result: any) => handleTodoResult(result, "Update a ToDo", todoKey))
            .catch((error: GraphQLFormattedError[]) => handleTodoError(error, "Update a ToDo: ", todoKey));*/
    }
    const toggleDone = (todo: TodoType) => {
        if (todo.isDone) {
            todo.isDone = false
        }else{
            todo.isDone = true
        }
        updateTodo(todo)
    }
    const onChangeOwner = (todo: TodoType) => {
        setSelectOwnerOpen(true)
        setTodo(todo)
    }
    const ShowEditPopup = () => {
        if (editOpen == true) {
            return (
                <Modal>
                    <TodoTS todo={todo} handleOnClose={editTodoClose} />
                </Modal>
            )
        }else{
            return (<></>)
        }
    }
    const showOwnerSelect = () => {
        if (selectOwnerOpen == true) {
            return (
                <Modal>
                    <OwnerSelect todo={todo} handleOnClose={editTodoClose} />
                </Modal>
            )
        }else{
            return (<></>)
        }
    }
  
    //------------------------------ Delete ------------------------------
    const confirmDelete = (todo: TodoType) => {
        setTodo(todo)
        setDeleteConfirmOpen(true)
    }
    const closeDeleteConfirm = () => {
        setDeleteConfirmOpen(false)
    }
    const showDeleteConfirm = () => {
        //Note the "&& todo" in the if() statement. If you don't do this, you get an error on
        //  "todo={todo}" in <TodoDeleteConfirm todo={todo}.../>. 
        //Gahead, try it: take && todo out of the if()
        if (deleteConfirmOpen && todo) {
            return (
                <Modal>
                    <TodoDeleteConfirm todo={todo} close={closeDeleteConfirm} deleteTodo={deleteTodo}/>
                </Modal>
            )
        }else{
            return <></>
        }
    }
    const deleteTodo = (deleteTodo: TodoType) => {
        const todoKey: string = deleteTodo.content
        client.models.Todo.delete( {id:deleteTodo.id} )
            .then((result: any) => handleTodoResult(result, "Delete", todoKey))
            .catch((error: GraphQLFormattedError[]) => handleTodoError(error, "Delete", todoKey))
    }  
  
    //------------------------------ Handle Todo Actions ------------------------------
    const handleTodoResult = (result: any, header: string, todoKey: string ) => {
        if (result.errors) {
            handleTodoError(result.errors, header, todoKey)
        }else{
            setAlertVisible(true)
            setAlertHeading(header)
            setAlertVariation("success")
            setAlertMsg("'" + todoKey + "' was successful")
        }
    }
    const handleTodoError = (errors: Array<GraphQLFormattedError>, header: string, todoKey: string) => {    
      var allErrors: string = ''
      for (const err of errors) {
        allErrors += "'" + todoKey + "' -->" + err.message
      }
      setAlertVisible(true)
      setAlertHeading(header + " Unexpeceted Error")
      setAlertVariation("error")
      setAlertMsg(allErrors)
    }

    const showAlerts = () => {
      if (alertVisible) {
        return(
          <Alert 
            hidden={false}
            variation={alertVariation} 
            isDismissible={true} 
            hasIcon={true} 
            heading={alertHeading}
            onDismiss={() => {setAlertVisible(false); setAlertMsg('');}}
          >
            {alertMsg}
          </Alert>
        )
      }else{
        return(<></>)
      }    
    }
    
    return (
        <div>
            <Flex direction="column"  backgroundColor={tokens.colors.green[20]}>
                <Flex direction="row">
                    <Button 
                        onClick={() => {setCreateOpen(true)}}
                        variation="link"
                    >
                        Create Todo
                    </Button>
                </Flex>

                {newTodo()}

                <Table variation="bordered">
                    <TableHead>
                        <TableRow>
                            <TableCell as="th">Description</TableCell>
                            <TableCell as="th" textAlign="center">Is Done?</TableCell>
                            <TableCell colSpan={2} style={{ textAlign: 'center', verticalAlign: 'middle'}} as="th">Action</TableCell>
                            <TableCell as="th">Owned By</TableCell>
                            <TableCell as="th">Assigned To</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {todos.map((todo: TodoType) => (
                            <TableRow key={todo.id}>
                                <TableCell>{todo.content}</TableCell>
                                <TableCell onClick={() => toggleDone(todo)} textAlign="center" title="click to change">
                                    {todo.isDone ? "Yes" : "No"}
                                </TableCell>
                                <TableCell>
                                    <Button onClick={() => confirmDelete(todo)} variation="link">
                                        Delete
                                    </Button></TableCell>
                                <TableCell>
                                    <Button onClick={() => editTodo(todo)} variation="link">
                                        Edit
                                    </Button></TableCell>
                                <TableCell onClick={() => onChangeOwner(todo)} textAlign="center" title="click to change">
                                    <p>ownerID: {todo.ownerId}</p>
                                    <p>Owner Name: {todo.owner.name}</p>
                                </TableCell>
                                <TableCell textAlign="center" title="click to change">
                                    {todo.assignedTo.name}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {ShowEditPopup()}
                {showDeleteConfirm()}
                {showOwnerSelect()}
                
                <div>
                    {showAlerts()}
                </div>
            </Flex>
        </div>
    );
}