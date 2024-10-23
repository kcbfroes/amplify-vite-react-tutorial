import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { Authenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import ListTodos from "./components/ListTodos";
import Todo from "./components/TodoTS"

const client = generateClient<Schema>();

function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const [createOpen, setCreateOpen] = useState(false)

  type AToDo = Schema["Todo"]["type"];
  const emptyToDo: AToDo = { content: null, isDone: false};

  useEffect(() => {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }, []);

  const newTodo = () => {
    if (createOpen) {
      return (
        <Todo todo={} handleOnClose={() => setCreateOpen(false)} />
      )
    }
  }

  const createTodo = (aTodo: Schema["Todo"]["type"]) => {
    client.models.Todo.create(aTodo);
  }

  const deleteTodo = (id: string) => {
    client.models.Todo.delete({ id })
  }

  return (        
    <Authenticator>
      {({ signOut, user }) => (
        <main>
          <h1>{user?.signInDetails?.loginId}'s todos</h1>
          
          <h1>My todos</h1>
          
          <button onClick={newTodo}>+ new</button>

          <ListTodos todoList={todos} onDelete={deleteTodo} />

          <ul>
            {todos.map((todo) => (
              <li 
                onClick={() => deleteTodo(todo.id)}
                key={todo.id}>{todo.content}
              </li>
            ))}
          </ul>          
          <button onClick={signOut}>Sign out</button>
        </main>        
      )}
    </Authenticator>
  );
}

export default App;
