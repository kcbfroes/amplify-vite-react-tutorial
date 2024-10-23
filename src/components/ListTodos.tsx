import { ListTodosProps } from "./Interfaces";


export default function ListTodos ( props: ListTodosProps ) {
    return (
        <div>
            <ul>
                {props.todoList.map((todo: any) => (
                    <li 
                        onClick={() => props.onDelete(todo.id)}
                        key={todo.id}>{todo.content}
                    </li>
                ))}
            </ul>
        </div>
    );
}