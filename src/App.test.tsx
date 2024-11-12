import { act, render, screen } from '@testing-library/react'
import App from './App'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { AppDataContext } from './context/AppDataContext';
import * as AmplifyUIReact from '@aws-amplify/ui-react'
import { Hub } from 'aws-amplify/utils';
import { CONNECTION_STATE_CHANGE } from 'aws-amplify/api';

const mockContextValue = {
  client: null, 
  todos: [],
  people: [],
  allDataSynced: true,   
};

//Mock Authenticator. This code is straight outa ChatGPT4o
vi.mock('@aws-amplify/ui-react', async () => {
  const actual = await vi.importActual<typeof AmplifyUIReact>('@aws-amplify/ui-react');
  return {
    ...actual,
    Authenticator: ({ children }: any) => (
      children({ signOut: vi.fn(), user: { signInDetails: { loginId: 'fakeUser' } } })
    ),
  };
});

// Cleanup after each test to prevent cross-test interference, straight outa ChatGPT4o
afterEach(() => {
  vi.clearAllMocks();
});

describe('Authentication', () => {
  it('Signs User In', async () => {
    
    //You have to wrap it in "act" because, well, you just have to.
    await act(async () => {
      render(
        <AppDataContext.Provider value={mockContextValue}>
          <App />
        </AppDataContext.Provider>
      )
    })
    
    // The slashes make it a "regular expression" and "equal"
    // The "i" makes it case insensative
    // findByText is async.  getByText is not. We like to wait.
    const userInfo = await screen.findByText(/fakeUser's todos/i)
    expect(userInfo).toBeInTheDocument();
  })
})

describe("API Connection Status", () => {
  it('shows "Connecting" status when API connection state is "Connecting', async () => {
    const connectionState="Connecting"
    // Note the "mockImplementationOnce" insted of "mockImplementation". 
    //  This is so we trigger only 1 time. If you just use "mockImplementation", you'll get too many re-renders.
    const hubListenMock = vi.spyOn(Hub, 'listen').mockImplementationOnce((channel, callback) => {
      if (channel === 'api') {
        callback({
          channel,
          payload: {
            event: CONNECTION_STATE_CHANGE,
            data: { connectionState: connectionState },
          },
        });
      }
      return () => {}; // return a noop function for cleanup
    });

    await act(async () => {
      render(
        <AppDataContext.Provider value={mockContextValue}>
          <App />
        </AppDataContext.Provider>
      )
    })
    //wait for the simulated user sign in
    await screen.findByText(/fakeUser's todos/i)

    // Check if the "Connecting" badge is displayed
    const apiBadge = await screen.findByText(connectionState)
    expect(apiBadge).toBeInTheDocument();
    expect(apiBadge).toHaveClass('amplify-badge--info')

    // Cleanup
    hubListenMock.mockRestore();
  })

})

it('shows "Connected" status if API connection state is "Connected"', async () => {
  const connectionState="Connected"
  
  //Note the "mockImplementationOnce" insted of "mockImplementation". 
  // This is so we trigger only 1 time. If you just use "mockImplementation", you'll get too many re-renders.
  const hubListenMock = vi.spyOn(Hub, 'listen').mockImplementationOnce((channel, callback) => {
    if (channel === 'api') {
      callback({
        channel,
        payload: {
          event: CONNECTION_STATE_CHANGE,
          data: { connectionState: connectionState },
        },
      });
    }
    return () => {}; // return a noop function for cleanup
  });

  await act(async () => {
    render(
      <AppDataContext.Provider value={mockContextValue}>
        <App />
      </AppDataContext.Provider>
    )
  })
  //wait for the simulated user sign in
  await screen.findByText(/fakeUser's todos/i)

  // Check if the "Connecting" badge is displayed
  const apiBadge = await screen.findByText(connectionState)
  expect(apiBadge).toBeInTheDocument();
  expect(apiBadge).toHaveClass('amplify-badge--success')

  // Cleanup
  hubListenMock.mockRestore();
})

it('shows "error" status if API connection state is not "Connecting" or "Connected"', async () => {
  const connectionState = 'whatever'

  //Note the "mockImplementationOnce" insted of "mockImplementation". 
  // This is so we trigger only 1 time. If you just use "mockImplementation", you'll get too many re-renders.
  const hubListenMock = vi.spyOn(Hub, 'listen').mockImplementationOnce((channel, callback) => {
    if (channel === 'api') {
      callback({
        channel,
        payload: {
          event: CONNECTION_STATE_CHANGE,
          data: { connectionState: connectionState },
        },
      });
    }
    return () => {}; // return a noop function for cleanup
  });

  await act(async () => {
    render(
      <AppDataContext.Provider value={mockContextValue}>
        <App />
      </AppDataContext.Provider>
    )
  })
  //wait for the simulated user sign in
  await screen.findByText(/fakeUser's todos/i)

  // Check if the "Connecting" badge is displayed
  const apiBadge = await screen.findByText(connectionState)
  expect(apiBadge).toBeInTheDocument();
  expect(apiBadge).toHaveClass('amplify-badge--error')

  // Cleanup
  hubListenMock.mockRestore();
})

describe('Context Validation', () => {
  it('renders the App component if context is available', () => {
    render(
      <AppDataContext.Provider value={mockContextValue}>
        <App />
      </AppDataContext.Provider>
    )
    //screen.debug() this command should log the DOM structure in the test terminal window.
  })
  it('throws an error if app context is not available', () => {
    const result = () => render(<App/>)
    expect(result).toThrowError("AppContext is not available")
  })
})