import { Schema } from "../../amplify/data/resource";

export interface TodoProps {
    todo: Schema["Todo"]["type"]
    handleOnClose: (value: Schema["Todo"]["type"], cancel:boolean) => void
}

export interface ListTodosProps {
    todoList: Array<Schema["Todo"]["type"]>
    onDelete: (todoID: string) => void
    onUpdate: (todo: Schema["Todo"]["type"]) => void
}

export const emptyToDo: Schema["Todo"]["type"] = {
    id: '',
    content: '', 
    isDone: false,
    createdAt: "",
    updatedAt: ""
  };