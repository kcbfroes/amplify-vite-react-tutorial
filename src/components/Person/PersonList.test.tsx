import { act, findByText, fireEvent, getByText, render, screen, within } from '@testing-library/react'
import App from '../../App'
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { AppDataContext } from '../../context/AppDataContext';
import * as AmplifyUIReact from '@aws-amplify/ui-react'
import { PersonType, TodoType } from '../../components/Interfaces';
import { FakePeople, FakeTodos } from '../../Test/FakeData';
import userEvent from '@testing-library/user-event'

var mockContextValue: {client: any, todos: Array<TodoType>, people: Array<PersonType>, allDataSynced: boolean}

const mockData = () => {
    return (
        {
            client: null, 
            todos: FakeTodos(),
            people: FakePeople(),
            allDataSynced: true,   
        }
    )
}

beforeEach(() => {
  mockContextValue = mockData()

  //Mock Authenticator (Sign In). This code is straight outa ChatGPT4o
  vi.mock('@aws-amplify/ui-react', async () => {
    const actual = await vi.importActual<typeof AmplifyUIReact>('@aws-amplify/ui-react');
    return {
      ...actual,
      Authenticator: ({ children }: any) => (
        children({ signOut: vi.fn(), user: { signInDetails: { loginId: 'fakeUser' } } })
      ),
    };
  });
})

// Cleanup after each test to prevent cross-test interference, straight outa ChatGPT4o
afterEach(() => {
  vi.clearAllMocks();
});

function FindPerson(personId: string) {
  for (var person of mockContextValue.people) {
    if (person.id == personId) return person 
  }
}

describe('People List', () => {
   
  it('shows a list of all people from the data context', async () => {
    
    await act(async () => {
      render(
        <AppDataContext.Provider value={mockContextValue}>
          <App />
        </AppDataContext.Provider>
      )
    })

    //make sure we're on the People List. Click the person button in the nav bar
    const userAction = userEvent.setup()
    await userAction.click(screen.getByRole('button', {name: /People/i}))

    const table = await screen.findByRole('table');
    const rows = within(table).getAllByRole('row');

    //Kinda by default, this test ensures data is presented in the correct order of columns.
    // How would you test that certain columns have actions associated with them?
    for (var row of rows) {  

      const personId = row.getAttribute('data-person-id');
      const personData = personId ? FindPerson(personId) : null;

      if (personData) {
        const { name, ownedTodos, assignedTodos } = personData;

        const cells = within(row).getAllByRole('cell');
        const actualName = cells[0].textContent;
        const actualOwned = cells[1].textContent;
        const actualAssigned = cells[2].textContent;
        const deleteCell = cells[3];
        const editCell = cells[4];

        expect(actualName).toEqual(name);
        expect(Number(actualOwned)).toEqual(ownedTodos.length);
        expect(Number(actualAssigned)).toEqual(assignedTodos.length);

        const deletePerson = within(deleteCell).getByRole('button', {name: 'Delete'} )
        fireEvent.click(deletePerson);
        //we should see the delete confirmation appear
        await screen.findByText(/delete this person?/i)
        await userAction.click(screen.getByRole('button', {name: /Close/i}))

        const editPerson = within(editCell).getByRole('button', {name: 'Edit'} )
        fireEvent.click(editPerson);
        //we should see the delete confirmation appear
        await screen.findByText(/user name/i)
        await userAction.click(screen.getByRole('button', {name: /Cancel/i}))
      }
    }
  })

})