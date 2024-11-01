import { Schema } from "../../amplify/data/resource";

export type TodoType = Schema["Todo"]["type"]
export type PersonType = Schema["Person"]["type"]

export interface NavigationProps {
    currentItem: string
    onSelectItem: (item: string) => void
}

export interface TodoProps {
    todo?: TodoType
    handleOnClose: (value: Partial<TodoType>, cancel:boolean) => void
}

export interface ListTodosProps {
    todoList: Array<TodoType>
    client: any
    //onDelete: (todoID: string) => void
    //onUpdate: (todo: TodoType) => void
}

export interface PersonListProps {
    personList: Array<PersonType>
    onDelete: (PersonID: string) => void
    onUpdate: (person: PersonType) => void
}

export interface ModalProps {
    isOpen: boolean
    children: any
}

export interface GraphQLFormattedError {
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: Array<string | number>;
    extensions?: { [key: string]: any };
}

export interface appErrorMsg {
    errMsg: string
    where: string
}