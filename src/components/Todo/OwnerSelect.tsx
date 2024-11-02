import { Autocomplete, Button, ComboBoxOption, Flex } from '@aws-amplify/ui-react';
import { OwnerSelectProps, PersonType } from '../Interfaces';
import { useContext, useState } from 'react';
import { AppDataContext } from '../../context/AppDataContext';

const context = useContext(AppDataContext)
if (!context) throw new Error("AppContext is not available")
const { people } = context

const peopleOptions = (people: Array<PersonType>): Array<ComboBoxOption> => {
    return people.map((person: PersonType) => ({
        label: person.name,
        id: person.id
    }));
};

const OwnerSelect: React.FC<OwnerSelectProps> = ({ todo, selectedPersonId, close}) => {

    const [value, setValue] = useState('');
    const [selectedId, setSelectedId] = useState('');
    const [selectedName, setSelectedName] = useState('');

    const handleSelect = () => {
        if (selectedId) {
            selectedPersonId(selectedId)
            close(true)
        }
    }
    const handleCancel = () => {
        close(true)
    }

    const options: Array<ComboBoxOption> = peopleOptions(people)

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
                label={"Select Owner for '" + todo.content + "'" }
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

export default OwnerSelect;