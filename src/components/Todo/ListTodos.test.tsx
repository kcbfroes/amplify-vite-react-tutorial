import { act, render, screen } from "@testing-library/react";
import App from "../../App";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { AppDataContext } from "../../context/AppDataContext";
import * as AmplifyUIReact from "@aws-amplify/ui-react";
import { PersonType, TodoType } from "../../components/Interfaces";
import { FakePeople, FakeTodos } from "../../Test/FakeData";
import userEvent from "@testing-library/user-event";

var mockContextValue: {
  client: any;
  todos: Array<TodoType>;
  people: Array<PersonType>;
  allDataSynced: boolean;
};

const mockData = () => {
  return {
    client: null,
    todos: FakeTodos(),
    people: FakePeople(),
    allDataSynced: true,
  };
};

beforeEach(() => {
  mockContextValue = mockData();

  //Mock Authenticator (Sign In). This code is straight outa ChatGPT4o
  vi.mock("@aws-amplify/ui-react", async () => {
    const actual = await vi.importActual<typeof AmplifyUIReact>(
      "@aws-amplify/ui-react"
    );
    return {
      ...actual,
      Authenticator: ({ children }: any) =>
        children({
          signOut: vi.fn(),
          user: { signInDetails: { loginId: "fakeUser" } },
        }),
    };
  });
});

// Cleanup after each test to prevent cross-test interference, straight outa ChatGPT4o
afterEach(() => {
  vi.clearAllMocks();
});

describe("Todo List", () => {
  it("shows a list of all the To Dos in db", async () => {
    await act(async () => {
      render(
        <AppDataContext.Provider value={mockContextValue}>
          <App />
        </AppDataContext.Provider>
      );
    });

    //make sure we're on the Todo List. Click the "To Dos" button in the nav bar
    const nav = userEvent.setup();
    await nav.click(screen.getByRole("button", { name: /To Dos/i }));

    for (var todo of FakeTodos()) {
      var result = await screen.findByText(todo.content, { exact: false });
      expect(result).toBeInTheDocument();
    }
  });
});
