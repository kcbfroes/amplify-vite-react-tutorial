import { act, render, screen } from '@testing-library/react'
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

describe('Nav menu tests', () => {
   
  it('it has a button for To Dos', async () => {
    
    await act(async () => {
      render(
        <AppDataContext.Provider value={mockContextValue}>
          <App />
        </AppDataContext.Provider>
      )
    })

    const nav = userEvent.setup()

    const todoButton = await screen.findByRole('button', {name: /To Dos/i})
    expect(todoButton).toBeInTheDocument();
    
    // Todos should be shown by default
    // expect the list of To dos to be displayed: We should be able to find the "Create Todo" button
    const createTodoButton = await screen.findByRole('button', {name: /Create Todo/i})    
    expect(createTodoButton).toBeInTheDocument();
    
    // I should see a "People" button in the nav bar
    const peopleButton = await screen.findByRole('button', {name: /People/i})
    expect(peopleButton).toBeInTheDocument();
    // and when I click it, I shold see a list of people
    await nav.click(peopleButton)
    // expect the list of People to be displayed: We should be able to find the "Create Person" button
    const createPersonButton = await screen.findByRole('button', {name: /Create Person/i})    
    expect(createPersonButton).toBeInTheDocument();

    //clicking the To Dos button will show To Dos
    await nav.click(todoButton)
    const result = await screen.findByRole('button', {name: /Create Todo/i})    
    expect(result).toBeInTheDocument();

    //We could test that each button is highlighted when clicked.

  })

})