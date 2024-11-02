import { Alert, Autocomplete, Button, Card, ComboBoxOption, Flex, Label } from '@aws-amplify/ui-react';
import { OwnerSelectProps, PersonType } from '../Interfaces';
import { useState } from 'react';

const peopleOptions = (people: Array<PersonType>): Array<ComboBoxOption> => {
    return people.map((person: PersonType) => ({
        label: person.name,
        id: person.id
    }));
};

export default function TodoDeleteConfirm(props: OwnerSelectProps) {

    const [value, setValue] = useState('');
    const [selectedId, setSelectedId] = useState('');
    const [selectedName, setSelectedName] = useState('');

    const handleSelect = () => {
        if (selectedId) {
            props.selectedPersonId(selectedId)
            props.close(true)
        }
    }
    const handleCancel = () => {
        props.close(true)
    }

    const options: Array<ComboBoxOption> = peopleOptions(props.people)

    const onChange = (event: any) => {
        setValue(event.target.value)
    }
    const onClear = () => {
        setSelectedId('')
        setSelectedName('')
    }
    const onSelect = (option: ComboBoxOption) => {
        setSelectedId(option.id)
        setSelectedName(option.label)
    }

    return (
        <div>
            <Autocomplete
                label="Select Owner for "
                options={options}
                value={value}
                onChange={onChange}
                onClear={onClear}
                onSelect={onSelect}
                placeholder="Type filter string here..."
                labelHidden={false}
            />
            <Flex direction='row' gap='20px'>
                <Button onClick={handleSelect}>Select {selectedName ? "'" + selectedName + "'" : ""}</Button>
                <Button variation='primary' onClick={handleCancel}>Close</Button>
            </Flex>
        </div>
    );
}