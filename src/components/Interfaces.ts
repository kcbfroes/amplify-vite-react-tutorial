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

export interface OwnerSelectProps {
    todo: TodoType
    selectedPersonId: (personId: string) => void
    close: (value: boolean) => void
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