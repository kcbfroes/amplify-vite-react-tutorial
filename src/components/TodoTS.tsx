import { TextField, CheckboxField, Button } from '@aws-amplify/ui-react';
import { SetStateAction, useState } from 'react';
import { TodoProps } from './Interfaces';

export default function TodoTS(props: TodoProps) {    

    const [content, setContent] = useState(props.todo.content);
    const [isDone, setIsDone] = useState(props.todo.isDone);

    type AnEvent = { target: { value: SetStateAction<string | null | undefined>; }; }

    const handleDescriptionChange = (event: AnEvent) => {
        setContent(event.target.value)
    }
    const handleIsDoneChange = (event: AnEvent) => {
        setIsDone(event.target.value ? true : false)
    }

    const handleSave = () => {
        props.todo.content = content;
        props.todo.isDone = isDone;
        props.handleOnClose();
    }
    const handleCancel = () => {
        props.handleOnClose();
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
                value={isDone ? 'yes' : 'no'}  
                onChange={handleIsDoneChange} 
            />
        
            <Button onClick={handleCancel}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
        </div>
    );
}