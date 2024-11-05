import { Button, Card, Flex, Label } from '@aws-amplify/ui-react';
import { TodoDeleteConfirmProps } from '../Interfaces';

export default function TodoDeleteConfirm(props: TodoDeleteConfirmProps) {

    const handleConfirm = () => {
        props.deleteTodo(props.todo)
        props.close(true)        
    }
    const handleCancel = () => {
        props.close(true)
    }

    return (
        <div>
            <Card variation='elevated'>
                <h2>Delete this To Do?</h2>
                <h3>{props.todo?.content}</h3>
            </Card>
            <Flex direction='row' gap='20px'>
                <Button onClick={handleConfirm}>Confirm</Button>
                <Button variation='primary' onClick={handleCancel}>Close</Button>
            </Flex>
        </div>
    );
}