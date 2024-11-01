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
  } from '@aws-amplify/ui-react';
import TodoTS from "./TodoTS";
import { useState } from "react";
import Modal from "../Modal";
  
export default function ListTodos ( props: ListTodosProps ) {

    //Alerts
    const [alertHeading, setAlertHeading] = useState('')
    const [alertMsg, setAlertMsg] = useState('')
    const [alertVariation, setAlertVariation] = useState<AlertVariations>("info")
    const [alertVisible, setAlertVisible] = useState(false)

    //All other
    const [createOpen, setCreateOpen] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [todo, setTodo] = useState<TodoType>()

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
            props.client.models.Todo.create({ content: "" + aTodo.content, isDone: aTodo.isDone })
                .then((result: any) => handleTodoResult(result, "Create a ToDo", aTodo))
                .catch((error: GraphQLFormattedError[]) => handleTodoError(error, "Create a ToDo", aTodo));
            }
            setCreateOpen(false);
    }
  
    //------------------------------ Edit/Update ------------------------------
    const updateTodo = (todo: TodoType) => {
        props.client.models.Todo.update(todo)
            .then((result: any) => handleTodoResult(result, "Update a ToDo", todo))
            .catch((error: GraphQLFormattedError[]) => handleTodoError(error, "Update a ToDo: ", todo));
    }
    const editTodoClose = (changedTodo:Partial<TodoType>, cancelled: boolean) => {
        setEditOpen(false)
        if (cancelled == false) {
            const mergedTodo: TodoType = Object.assign({}, todo, changedTodo)
            updateTodo(mergedTodo)            
        }
    }
    const toggleDone = (todo: Schema["Todo"]["type"]) => {
        if (todo.isDone) {
            todo.isDone = false
        }else{
            todo.isDone = true
        }
        updateTodo(todo)
    }
  
    //------------------------------ Delete ------------------------------
    const deleteTodo = (id: string) => {
        props.client.models.Todo.delete({ id })
            .then((result: any) => handleTodoDeleteResult(result, id))
            .catch((error: GraphQLFormattedError[]) => handleTodoDeleteError(error, id));
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

    const editTodo = (todo: TodoType) => {
        setEditOpen(true)
        setTodo(todo)
    } 
    const ShowEditPopup = () => {
        if (editOpen == true) {
            return (
                <div>
                    <TodoTS todo={todo} handleOnClose={editTodoClose} />
                </div>
            )
        }else{
            return (<></>)
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
  
    const findTodoById = (id: string) => { return props.todoList.find(todo => todo.id == id) }
    
    return (
        <div>
            <Flex>
                <Flex direction="row" wrap="nowrap" gap="1rem" backgroundColor='green.20' padding='10px'>
                <button onClick={() => {setCreateOpen(true)}}>Create Todo</button>
                </Flex>

                {newTodo()}
            </Flex>

            <Table variation="bordered">
                <TableHead>
                    <TableRow>
                        <TableCell as="th">Description</TableCell>
                        <TableCell as="th">Is Done? (click me)</TableCell>
                        <TableCell colSpan={2} style={{ textAlign: 'center', verticalAlign: 'middle'}} as="th">Action</TableCell>
                        <TableCell as="th">ID</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {props.todoList.map((todo: TodoType) => (
                        <TableRow key={todo.id}>
                            <TableCell>{todo.content}</TableCell>
                            <TableCell onClick={() => toggleDone(todo)}>{todo.isDone ? "Yes" : "No"}</TableCell>
                            <TableCell onClick={() => deleteTodo(todo.id)} >Delete</TableCell>
                            <TableCell onClick={() => editTodo(todo)}>Edit</TableCell>
                            <TableCell>{todo.id}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {ShowEditPopup()}
            
            <div>
                {showAlerts()}
            </div>
        </div>
    );
}