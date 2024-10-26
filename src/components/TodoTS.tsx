import { TextField, CheckboxField, Button } from '@aws-amplify/ui-react';
import { SetStateAction, useState } from 'react';
import { emptyToDo, TodoProps } from './Interfaces';

export default function TodoTS(props: TodoProps) {    

    const [content, setContent] = useState(props.todo.content);
    const [isDone, setIsDone] = useState(props.todo.isDone);

    type AnEvent = { target: { value: SetStateAction<string | null | undefined>; }; }

    const handleDescriptionChange = (event: AnEvent) => {
        setContent('' + event.target.value)
    }
    const handleIsDoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log("In TodoTS, handleIsDone old value is: ", event.target.value)
        console.log("In TodoTS, handleIsDone checkbox checked? ", event.target.checked)
        setIsDone(event.target.checked)
    }

    const handleSave = () => {
        props.todo.content = content;
        props.todo.isDone = isDone;
        console.log("In TodoTS, Save clicked: ", props.todo);
        props.handleOnClose(props.todo, false);
    }
    const handleCancel = () => {
        console.log("In TodoTS, Cancel clicked");
        props.handleOnClose(emptyToDo, true);
    }

    return (
        <div>
            <TextField
                label='Description'
                name='todoDescription'
                value={'' + content}
                onChange={handleDescriptionChange}
            />

            <CheckboxField                
                label='Is Done?'
                name='isDone'
                value={isDone ? "Yes" : "No"}
                checked={isDone ? true : false}
                onChange={handleIsDoneChange} 
            />
        
            <Button onClick={handleCancel}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
        </div>
    );
}