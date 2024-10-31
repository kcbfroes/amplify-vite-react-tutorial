import { Schema } from "../../../amplify/data/resource";
import { ListTodosProps, TodoType } from "../Interfaces";
import {
    Table,
    TableCell,
    TableBody,
    TableHead,
    TableRow,
  } from '@aws-amplify/ui-react';
import TodoTS from "./TodoTS";
import { useState } from "react";
  
export default function ListTodos ( props: ListTodosProps ) {

    const [editOpen, setEditOpen] = useState(false)
    const [todo, setTodo] = useState<TodoType>()

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

    const editTodoClose = (changedTodo:Partial<TodoType>, cancelled: boolean) => {
        setEditOpen(false)
        if (cancelled == false) {
            const mergedTodo: TodoType = Object.assign({}, todo, changedTodo)
            props.onUpdate(mergedTodo)            
        }
    }

    const toggleDone = (todo: Schema["Todo"]["type"]) => {
        if (todo.isDone) {
            todo.isDone = false
        }else{
            todo.isDone = true
        }
        props.onUpdate(todo)
    }
    
    return (
        <div>
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
                            <TableCell onClick={() => props.onDelete(todo.id)} >Delete</TableCell>
                            <TableCell onClick={() => editTodo(todo)}>Edit</TableCell>
                            <TableCell>{todo.id}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            {ShowEditPopup()}
        </div>
    );
}