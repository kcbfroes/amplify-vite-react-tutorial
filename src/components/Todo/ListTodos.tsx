import { Schema } from "../../../amplify/data/resource";
import { GraphQLFormattedError, ListTodosProps, TodoType } from "../Interfaces";
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
import { useState } from "react";
import Modal from "../Modal";
import TodoDeleteConfirm from "./TodoDeleteConfirm";
import OwnerSelect from "./OwnerSelect";
  
export default function ListTodos ( props: ListTodosProps ) {
    const { tokens } = useTheme();

    //Alerts
    const [alertHeading, setAlertHeading] = useState('')
    const [alertMsg, setAlertMsg] = useState('')
    const [alertVariation, setAlertVariation] = useState<AlertVariations>("info")
    const [alertVisible, setAlertVisible] = useState(false)

    //All other
    const [createOpen, setCreateOpen] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [todo, setTodo] = useState<TodoType>()        //useState<TodoType>() makes "todo" a type: TodoType | underfined
    const [modalOpen, setModalOpen] = useState(false)

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
            const todoKey: string = '' + aTodo.content
            props.client.models.Todo.create({ content: "" + aTodo.content, isDone: aTodo.isDone })
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
        if (cancelled == false) {
            const mergedTodo: TodoType = Object.assign({}, todo, changedTodo)
            updateTodo(mergedTodo)            
        }
    }
    const ShowEditPopup = () => {
        if (editOpen == true) {
            return (
                <Modal isOpen={editOpen}>
                    <TodoTS todo={todo} handleOnClose={editTodoClose} />
                </Modal>
            )
        }else{
            return (<></>)
        }
    }
    const updateTodo = (todo: TodoType) => {
        const todoKey: string = todo.content
        props.client.models.Todo.update(todo)
            .then((result: any) => handleTodoResult(result, "Update a ToDo", todoKey))
            .catch((error: GraphQLFormattedError[]) => handleTodoError(error, "Update a ToDo: ", todoKey));
    }
    const toggleDone = (todo: Schema["Todo"]["type"]) => {
        if (todo.isDone) {
            todo.isDone = false
        }else{
            todo.isDone = true
        }
        updateTodo(todo)
    }
    const onChangeOwner = () => {

    }
    const showOwnerSelect = () => {
        if (selectOwner == true) {
            return (
                <Modal isOpen={editOpen}>
                    <OwnerSelect todo={todo} people={} handleOnClose={editTodoClose} />
                </Modal>
            )
        }else{
            return (<></>)
        }
    }
  
    //------------------------------ Delete ------------------------------
    const confirmDelete = (todo: TodoType) => {
        setTodo(todo)
        setModalOpen(true)
    }
    const closeDeleteConfirm = () => {
        setModalOpen(false)
    }
    const showDeleteConfirm = () => {
        //Note the "&& todo" in the if() statement. If you don't do this, you get an error on
        //  "todo={todo}" in <TodoDeleteConfirm todo={todo}.../>. 
        //Gahead, try it: take && todo out of the if()
        if (modalOpen && todo) {
            return (
                <Modal isOpen={modalOpen}>
                    <TodoDeleteConfirm todo={todo} close={closeDeleteConfirm} deleteTodo={deleteTodo}/>
                </Modal>
            )
        }else{
            return <></>
        }
    }
    const deleteTodo = (deleteTodo: TodoType) => {
        const todoKey: string = deleteTodo.content
        props.client.models.Todo.delete( {id:deleteTodo.id} )
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
                        {props.todoList.map((todo: TodoType) => (
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
                                    {todo.owner.name}
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
                
                <div>
                    {showAlerts()}
                </div>
            </Flex>
        </div>
    );
}