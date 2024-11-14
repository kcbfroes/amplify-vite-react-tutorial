// Import necessary testing utilities
import { act, render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useContext } from 'react';

import { AppDataContext, AppDataProvider } from './AppDataContext';

// Mock generateClient to return a mock client directly inside vi.mock
vi.mock('aws-amplify/api', () => ({
  generateClient: () => ({
    models: {
      Todo: {
        observeQuery: vi.fn(() => ({
          subscribe: (callback: (data: { items: any[]; isSynced: boolean }) => void) => {
            // Call the callback with mock data
            if (typeof callback === 'function') {
              callback({
                items: [{ id: 'T1', content: 'Fake Task 1', isDone: false, ownerId: 'ABC', assignedToId: 'def' }],
                isSynced: true,
              });
            }
            return { unsubscribe: vi.fn() };
          },
        })),
      },
      Person: {
        observeQuery: vi.fn(() => ({
          subscribe: (callback: (data: { items: any[]; isSynced: boolean }) => void) => {
            // Call the callback with mock data
            if (typeof callback === 'function') {
              callback({
                items: [{ id: 'P1', name: 'Fake Person A',  }],
                isSynced: true,
              });
            }
            return { unsubscribe: vi.fn() };
          },
        })),
      },
    },
  }),
}));

// Test component to consume the context
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

    expect(screen.getByText(/Synced is Yes/i)).toBeInTheDocument();
    expect(screen.getByText(/Number of Todos:1/i)).toBeInTheDocument();
    expect(screen.getByText(/Number of People:1/i)).toBeInTheDocument();
  });
});