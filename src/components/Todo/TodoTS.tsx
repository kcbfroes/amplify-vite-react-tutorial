import { TextField, CheckboxField, Button } from '@aws-amplify/ui-react';
import React, { useEffect, useState } from 'react';
import { TodoProps, TodoType } from '../Interfaces';

const TodoTS: React.FC<TodoProps> = ({ todo, handleOnClose}) => {    

    const [content, setContent] = useState<string>();
    const [isDone, setIsDone] = useState<boolean>();

    useEffect(() => {
        if (todo) {
            setContent(todo.content);
            const done = todo.isDone ? true : false
            setIsDone(done);
        }
    }, [todo]);

    const handleSave = () => {
        const todoUpdated: Partial<TodoType> = {content, isDone}
        handleOnClose(todoUpdated, false);
    }
    const handleCancel = () => {
        const emptyTodo: Partial<TodoType> = {}
        handleOnClose(emptyTodo, true);
    }

    return (
        <div>
            <TextField
                label='Description'
                name='todoDescription'
                value={'' + content}
                onChange={(e) => setContent(e.target.value)}
            />

            <CheckboxField                
                label='Is Done?'
                name='isDone'
                value={isDone ? "Yes" : "No"}
                checked={isDone ? true : false}
                onChange={(e) => setIsDone(e.target.checked)} 
            />
        
            <Button onClick={handleCancel}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
        </div>
    );
}

export default TodoTS;