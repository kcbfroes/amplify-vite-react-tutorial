// Import necessary testing utilities
import { act, render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeAll } from "vitest";
import { dbPeople, dbTodos, FakePeople, FakeTodos } from "../Test/FakeData";
import { useContext } from "react";

// Mock generateClient to return a mock client directly inside vi.mock
beforeAll(() => {
  vi.mock("aws-amplify/api", () => {
    return {
      generateClient: () => ({
        models: {
          Todo: {
            observeQuery: vi.fn(() => {
              return {
                subscribe: ({ next }: { next: Function }) => {
                  if (typeof next === "function") {
                    next({
                      items: dbTodos(), //note that we give it dbTodos here
                      isSynced: true,
                    });
                  }
                  return { unsubscribe: vi.fn() };
                },
              };
            }),
          },

          Person: {
            observeQuery: vi.fn(() => {
              return {
                subscribe: ({ next }: { next: Function }) => {
                  if (typeof next === "function") {
                    next({
                      items: dbPeople(),  //Note that we give it dbPeople here
                      isSynced: true,
                    });
                  }
                  return { unsubscribe: vi.fn() };
                },
              };
            }),
          },
        },
      }),
    };
  });
});

//this import has to happen here so AppDataContext will get the mock client defined above.
import { AppDataContext, AppDataProvider } from "./AppDataContext";

// Define a test component, just for this module, to consume the context so we can test it.
const TestComponent = () => {
  const context = useContext(AppDataContext);
  if (!context) throw new Error("AppDataContext is unavailable");

  const { todos, people, allDataSynced } = context;

  return (
    <div>
      <p>{allDataSynced ? "Synced is Yes" : "Synched is No"}</p>
      <p>{"Number of Todos:" + todos.length}</p>
      <p>{"Number of People:" + people.length}</p>

      <h3>Todo List</h3>
      {todos.length > 0 ? (
        <ul>
          {todos.map((todo, index) => (
            <li key={todo.id || index}>
              {`ID: ${todo.id} Content: ${todo.content} OwnerName: ${todo.ownerName} AssignedName: ${todo.assignedToName}`}
            </li>
          ))}
        </ul>
      ) : (
        <p>No todos found</p>
      )}

      <h3>People List</h3>
      {people.length > 0 ? (
        <ul>
          {people.map((person, index) => (
            <li key={person.id || index}>
              {`ID: ${person.id} Name: ${person.name} Owned: ${person.ownedTodos.length} Assigned: ${person.assignedTodos.length}`}
            </li>
          ))}
        </ul>
      ) : (
        <p>No people found</p>
      )}

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

    var result = await screen.findByText(/Synced is Yes/i);
    expect(result).toBeInTheDocument();

    result = await screen.findByText(/Number of Todos:6/i);
    expect(result).toBeInTheDocument();

    result = await screen.findByText(/Number of People:4/i);
    expect(result).toBeInTheDocument();

    //FakeTodos() is what we expect the Context to convert the dbTodos() into.
    for (var todo of FakeTodos()) {
      const expected = `ID: ${todo.id} Content: ${todo.content} OwnerName: ${todo.ownerName} AssignedName: ${todo.assignedToName}`
      result = await screen.findByText(expected);
      expect(result).toBeInTheDocument();
    }

    //FakePeople() is what we expect the Context to convert dbPeople into.
    for (var person of FakePeople()) {
      const expected = `ID: ${person.id} Name: ${person.name} Owned: ${person.ownedTodos.length} Assigned: ${person.assignedTodos.length}`
      result = await screen.findByText(expected);
      expect(result).toBeInTheDocument();
    }
  });
});
