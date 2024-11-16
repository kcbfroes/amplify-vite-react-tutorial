// Import necessary testing utilities
import { act, render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { useContext } from 'react';

// Mock generateClient to return a mock client directly inside vi.mock
beforeAll(() => {
  vi.mock('aws-amplify/api', () => {  
    return {
      generateClient: () => ({
        models: {

          Todo: {
            observeQuery: vi.fn(() => {
              return {
                subscribe: ({ next }: { next: Function }) => {
                  if (typeof next === 'function') {
                    next({
                      items: [{ id: 'T1', content: 'Fake Task 1', isDone: false, ownerId: 'ABC', assignedToId: 'def' }],
                      isSynced: true,
                    });
                  }
                  return { unsubscribe: vi.fn() };
                },
              }
            }),
          },

          Person: {
            observeQuery: vi.fn(() => {
              return {
                subscribe: ({ next }: { next: Function }) => {
                  if (typeof next === 'function') {
                    next({
                      items: [{ id: 'P1', name: 'Fake Person A',  }],
                      isSynced: true,
                    });
                  }
                  return { unsubscribe: vi.fn() };
                },
              }
            }),
          },

        },
      }),
    }
  });
});

//this import has to happen here so AppDataContext will get the mock client defined above.
import { AppDataContext, AppDataProvider } from './AppDataContext';

// Define a test component, just for this module, to consume the context so we can test it.
const TestComponent = () => {
  const context = useContext(AppDataContext);
  if (!context) throw new Error("AppDataContext is unavailable");

  const { todos, people, allDataSynced } = context;

  return (
    <div>
      <p>{allDataSynced ? 'Synced is Yes' : 'Synched is No'}</p>
      <p>{"Number of Todos:" + todos.length}</p>
      <p>{"Number of People:" + people.length}</p>
    </div>
  );
};

describe('AppDataContext', () => {
  it('provides initial context values correctly', async () => {
    await act(async () => {
      render(
        <AppDataProvider>
          <TestComponent />
        </AppDataProvider>
      );
    });

    var result = await screen.findByText(/Synced is Yes/i)
    expect(result).toBeInTheDocument();

    result = await screen.findByText(/Number of Todos:1/i)
    expect(result).toBeInTheDocument();

    result = await screen.findByText(/Number of People:1/i)
    expect(result).toBeInTheDocument();
  });
});