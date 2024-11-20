import { act, render, screen } from "@testing-library/react";
import { describe, it, expect, vi, afterEach, beforeAll } from "vitest";
import { AppDataContext, AppDataProvider } from "./AppDataContext";
import { useContext } from "react";
import { generateClient } from "aws-amplify/api";
import { Schema } from "../../amplify/data/resource";

type ATodo = {
  id: string;
  content: string;
  isDone: boolean;
  ownerId: string;
  assignedToId: string;
};
type subscribeData = { items: Array<ATodo>; isSynced: boolean };

const mockClient = generateClient<Schema>() as {
  models: {
    Todo: {
      observeQuery: () => {
        subscribe: (callback: (data: subscribeData) => void) => {
          unsubscribe: () => void;
        };
      };
    };
  };
};

// Mock observeQuery and subscribe methods here
const mockObserveQuery: () => {
  subscribe: (callback: (data: subscribeData) => void) => {
    unsubscribe: () => void;
  };
} = vi.fn(() => ({
  subscribe: (callback: Function) => {
    callback({
      items: [
        {
          id: "1",
          content: "Fake Task 1",
          isDone: false,
          ownerId: "ABC",
          assignedToId: "def",
        },
      ],
      isSynced: true,
    });
    return { unsubscribe: vi.fn() };
  },
}));

// Spy on the observeQuery method for the `Todo` model
vi.spyOn(mockClient.models.Todo, "observeQuery").mockImplementation(
  mockObserveQuery
);

// Test component to consume the context
const TestComponent = () => {
  const context = useContext(AppDataContext);
  if (!context) throw new Error("AppDataContext is unavailable");

  const { todos, allDataSynced } = context;

  return (
    <div>
      <p>Data Synced: {allDataSynced ? "Yes" : "No"}</p>
      {todos.map((todo) => (
        <p key={todo.id}>{todo.content}</p>
      ))}
    </div>
  );
};

describe("AppDataContext", () => {
  it("provides initial context values correctly", async () => {
    await act(async () => {
      render(
        <AppDataProvider>
          <TestComponent />
        </AppDataProvider>
      );
    });

    expect(screen.getByText(/Data Synced: Yes/i)).toBeInTheDocument();
    expect(screen.getByText(/Fake Task 1/i)).toBeInTheDocument();
  });
});
