import { Schema } from "../../amplify/data/resource";

export interface TodoProps {
    todo: Schema["Todo"]["type"]
    handleOnClose: () => void
}

export interface ListTodosProps {
    todoList: any
    onDelete: (todoID: string) => void
}