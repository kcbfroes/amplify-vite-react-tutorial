import React, { useEffect, useState } from 'react';
import { PersonProps, PersonType } from '../Interfaces';
import { Button, TextField } from '@aws-amplify/ui-react';

const PersonTS: React.FC<PersonProps> = ({ person, handleOnClose}) => {

    const [name, setName] = useState<string>();

    useEffect(() => {
        if (person) {
            setName(person.name);            
        }else{
            setName('')
        }
    }, [person]);

    const handleSave = () => {
        const updated: Partial<PersonType> = {name}
        handleOnClose(updated, false);
    }
    const handleCancel = () => {
        const emptyPerson: Partial<PersonType> = {}
        handleOnClose(emptyPerson, true);
    }
    return (
        <div>
            <TextField
                label='Description'
                name='todoDescription'
                value={'' + name}
                onChange={(e) => setName(e.target.value)}
            />
        
            <Button onClick={handleCancel}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
        </div>
    );
}
export default PersonTS
