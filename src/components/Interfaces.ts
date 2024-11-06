import { Schema } from "../../amplify/data/resource";

//this simply will NOT do. The Schema is too complicate to repeat.
//Instead, we should just define what our Todo and Person looks like.
//I'm hoping we can the use the basic types to update the DB.
export type oldTodoType = Schema["Todo"]["type"]
export type oldPersonType = Schema["Person"]["type"]
//New Types:
export type TodoType = {
    id: string
    content?: string
    isDone?: boolean | null
    ownerId?: string
    ownerName?: string
    assignedToId?: string
    assignedToName?: string
}
export type PersonType = {
    id: string
    name: string
    ownedTodos: Array<TodoType>
    assignedTodos: Array<TodoType>
}

export interface NavigationProps {
    currentItem: string
    onSelectItem: (item: string) => void
}

export interface TodoProps {
    todo?: TodoType
    handleOnClose: (value: Partial<TodoType>, cancel:boolean) => void
}

export interface TodoDeleteConfirmProps {
    todo: TodoType
    close: (value: boolean) => void
    deleteTodo: (todo: TodoType) => void
}

export interface PersonListProps {
    personList: Array<PersonType>
    client: any
}

export interface PersonProps {
    person?: PersonType
    handleOnClose: (value: Partial<PersonType>, cancel:boolean) => void
}

export interface PersonDeleteConfirmProps {
    person: PersonType
    close: (value: boolean) => void
    deletePerson: (person: PersonType) => void
}

export interface ModalProps {
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