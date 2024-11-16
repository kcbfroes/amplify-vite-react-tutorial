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

describe('People List', () => {
   
  it('shows a list of all people in db', async () => {
    
    await act(async () => {
      render(
        <AppDataContext.Provider value={mockContextValue}>
          <App />
        </AppDataContext.Provider>
      )
    })

  //make sure we're on the People List. Click the person button in the nav bar
  const nav = userEvent.setup()
  await nav.click(screen.getByRole('button', {name: /People/i}))

    for (var person of FakePeople()) {
      var result = await screen.findByText(person.name, {exact:false})
      expect(result).toBeInTheDocument();

      //I can't use "findByText" to test for owned and assigned to counts (becasue there are multiple 1, 0, 3 etc.) on the screen.
      //So even if a "findByText" value that matches only once, how do I know which person it goes with?
      //How do I find specific rows of a table?  What is the best way to determine a cell in a table has a particular value?
     
    }

  })

})