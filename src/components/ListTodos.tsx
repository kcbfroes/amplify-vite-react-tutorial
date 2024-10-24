import { Schema } from "../../amplify/data/resource";
import { ListTodosProps } from "./Interfaces";
import {
    Table,
    TableCell,
    TableBody,
    TableHead,
    TableRow,
  } from '@aws-amplify/ui-react';
import TodoTS from "./TodoTS";
import { useState } from "react";
import { booleanToCloudFormation } from "aws-cdk-lib";
  
export default function ListTodos ( props: ListTodosProps ) {

    const [editOpen, setEditOpen] = useState(false)

    const editTodo = (todo: Schema["Todo"]["type"]) => {
        setEditOpen(true)
        return (
            <div>
                <TodoTS todo={todo} handleOnClose={editTodoClose} />
            </div>
        )
    } 

    const editTodoClose = (changedTodo: Schema["Todo"]["type"], cancelled: boolean) => {
        setEditOpen(false)
        if (cancelled == false) {
            props.onUpdate(changedTodo)            
        }
    }
    
    return (
        <div>
            <Table variation="bordered">
                <TableHead>
                    <TableRow>
                        <TableCell as="th">Description</TableCell>
                        <TableCell as="th">Is Done?</TableCell>
                        <TableCell colSpan={2} style={{ textAlign: 'center', verticalAlign: 'middle'}} as="th">Action</TableCell>
                        <TableCell as="th">ID</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {props.todoList.map((todo: any) => (
                        <TableRow key={todo.id}>
                            <TableCell>{todo.content}</TableCell>
                            <TableCell>{todo.isDone ? "" : "Yes"}</TableCell>
                            <TableCell onClick={() => props.onDelete(todo.id)} >Delete</TableCell>
                            <TableCell onClick={() => editTodo(todo)}>Edit</TableCell>
                            <TableCell>{todo.id}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}