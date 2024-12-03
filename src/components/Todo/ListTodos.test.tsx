import { act, fireEvent, render, screen, within } from "@testing-library/react";
import App from "../../App";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { AppDataContext } from "../../context/AppDataContext";
import * as AmplifyUIReact from "@aws-amplify/ui-react";
import { PersonType, TodoType } from "../../components/Interfaces";
import { FakePeople, FakeTodos } from "../../Test/FakeData";
import userEvent from "@testing-library/user-event";
import ListTodos from "./ListTodos";

var mockContextValue: {
  client: any;
  todos: Array<TodoType>;
  people: Array<PersonType>;
  allDataSynced: boolean;
};


const mockData = () => {
  return {
    client: {
      models: {
        Todo: {
          create: vi.fn(),
          update: vi.fn(),
          delete: vi.fn(),
        },
      },
    },
    todos: FakeTodos(),
    people: FakePeople(),
    allDataSynced: true,
  };
};

beforeEach(() => {
  mockContextValue = mockData();
});

// Cleanup after each test to prevent cross-test interference, straight outa ChatGPT4o
afterEach(() => {
  vi.clearAllMocks();
});

describe("Todo List shows correct data", () => {
  it("shows a list of all the To Dos from the Context", async () => {
    /*await act(async () => {
      render(
        <AppDataContext.Provider value={mockContextValue}>
          <App />
        </AppDataContext.Provider>
      );
    });*/

    render(
      <AppDataContext.Provider value={mockContextValue}>
        <ListTodos />
      </AppDataContext.Provider>
    );

    const table = await screen.findByRole("tablebody");
    const rows = within(table).getAllByRole("row");

    //Kinda by default, this test ensures data is presented in the correct order of columns.
    for (var row of rows) {

      const cells = within(row).getAllByRole("cell");
      const todoContent = cells[0].textContent;
      const isDone = cells[1].textContent;
      const deleteCell = cells[2];
      const editCell = cells[3];
      const ownerName = cells[4].textContent;
      const assignedName = cells[5].textContent;

      const todoId = row.getAttribute("data-todo-id");
      let todo: TodoType | undefined;
      todo = mockContextValue.todos.find((t) => t.id === todoId);
      if (todo) {
        expect(todoContent).toEqual(todo.content);
        expect(isDone).toEqual(todo.isDone ? "Yes" : "No");
        expect(ownerName).toEqual(todo.ownerName);
        expect(assignedName).toEqual(todo.assignedToName);
      }else{
        throw new Error(`Todo with id ${todoId} not found`);
      }
    }
  });
  
});

describe("Todo List update actions work", () => {
  it("toggles the todo done between yes and no", async () => {
    
    var updatedTodo = {
      id: mockContextValue.todos[0].id,
      content: mockContextValue.todos[0].content,
      isDone: mockContextValue.todos[0].isDone ? "No" : "Yes",  //Note: this is reversed
      ownerId: mockContextValue.todos[0].ownerId,
      assignedToId: mockContextValue.todos[0].assignedToId,
    };

    //We should call update with a toggled isDone value
    const createSpy = vi.spyOn(mockContextValue.client.models.Todo, 'update').mockResolvedValue({ data: updatedTodo });
    
    render(
      <AppDataContext.Provider value={mockContextValue}>
        <ListTodos />
      </AppDataContext.Provider>
    );

    const table = await screen.findByRole("tablebody");
    const rows = within(table).getAllByRole("row");
    const cells = within(rows[0]).getAllByRole("cell");
    const isDoneCell = cells[3];
    const toggleIsDone = within(isDoneCell).getByRole("button", { name: "Edit", hidden: true });
    
    fireEvent.click(toggleIsDone);
    const successAlert = await screen.findByText(/Update a Todo/);
    expect(successAlert).toBeInTheDocument();
    expect(createSpy).toHaveBeenCalledWith(updatedTodo);
    
    fireEvent.click(toggleIsDone);
    expect(createSpy).toHaveBeenCalledWith(mockContextValue.todos[0]);
  });
  
});