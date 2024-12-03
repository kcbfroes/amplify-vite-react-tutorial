import { act, fireEvent, render, screen, within } from "@testing-library/react";
import App from "../../App";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { AppDataContext } from "../../context/AppDataContext";
import * as AmplifyUIReact from "@aws-amplify/ui-react";
import { PersonType, TodoType } from "../../components/Interfaces";
import { FakePeople, FakeTodos } from "../../Test/FakeData";
import userEvent from "@testing-library/user-event";
import PersonList from "./PersonList";

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
        Person: {
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

function FindPerson(personId: string) {
  for (var person of mockContextValue.people) {
    if (person.id == personId) return person;
  }
}

describe("People List", () => {
  it("Should display an error message when AppContext is not available", async () => {
    await expect(async () => {
      render(
        <AppDataContext.Provider value={undefined}>
          <PersonList />
        </AppDataContext.Provider>
      );
    }).rejects.toThrow("AppContext is not available");

    // Restore the original implementation
    vi.restoreAllMocks();
  });

  it("shows a list of all people from the data context", async () => {
    await act(async () => {
      render(
        <AppDataContext.Provider value={mockContextValue}>
          <App />
        </AppDataContext.Provider>
      );
    });

    //make sure we're on the People List. Click the person button in the nav bar
    const userAction = userEvent.setup();
    await userAction.click(screen.getByRole("button", { name: /People/i }));

    const table = await screen.findByRole("table");
    const rows = within(table).getAllByRole("row");

    //Kinda by default, this test ensures data is presented in the correct order of columns.
    for (var row of rows) {
      const personId = row.getAttribute("data-person-id");
      const personData = personId ? FindPerson(personId) : null;

      if (personData) {
        const { name, ownedTodos, assignedTodos } = personData;

        const cells = within(row).getAllByRole("cell");
        const actualName = cells[0].textContent;
        const actualOwned = cells[1].textContent;
        const actualAssigned = cells[2].textContent;
        const deleteCell = cells[3];
        const editCell = cells[4];

        expect(actualName).toEqual(name);
        expect(Number(actualOwned)).toEqual(ownedTodos.length);
        expect(Number(actualAssigned)).toEqual(assignedTodos.length);

        const deletePerson = within(deleteCell).getByRole("button", {
          name: "Delete",
        });
        fireEvent.click(deletePerson);
        //we should see the delete confirmation appear
        await screen.findByText(/delete this person?/i);
        await userAction.click(screen.getByRole("button", { name: /Close/i }));

        const editPerson = within(editCell).getByRole("button", {
          name: "Edit",
        });
        fireEvent.click(editPerson);
        //we should see the delete confirmation appear
        await screen.findByText(/user name/i);
        await userAction.click(screen.getByRole("button", { name: /Cancel/i }));
      }
    }
  });

  it("Should create a new person successfully and show a success alert", async () => {
    const newPerson = { name: "John Doe" };

   const createSpy = vi.spyOn(mockContextValue.client.models.Person, 'create')
    .mockResolvedValue({ data: newPerson });

    await act(async () => {
      render(
        <AppDataContext.Provider value={mockContextValue}>
          <PersonList />
        </AppDataContext.Provider>
      );
    });

    const createButton = screen.getByText("Create Person");
    await userEvent.click(createButton);

    const personNameInput = screen.getByLabelText("User Name");
    const submitButton = screen.getByText("Save");

    await userEvent.type(personNameInput, newPerson.name);
    await userEvent.click(submitButton);

    expect(createSpy).toHaveBeenCalledWith({ name: newPerson.name, });

    const successAlert = await screen.findByText(/Create a Person/);
    expect(successAlert).toBeInTheDocument();
    expect(
      screen.getByText(`'${newPerson.name}' was successful`)
    ).toBeInTheDocument();

    createSpy.mockRestore();
  });

  it("Should update a new person successfully and show a success alert", async () => {
    const newName = { name: "John Doe" };

    const createSpy = vi.spyOn(mockContextValue.client.models.Person, 'update').mockResolvedValue({ data: newName });

    await act(async () => {
      render(
        <AppDataContext.Provider value={mockContextValue}>
          <PersonList />
        </AppDataContext.Provider>
      );
    });

    const updatedPerson = mockContextValue.people[0];
    updatedPerson.name = newName.name;

    const table = await screen.findByRole("tablebody");
    const rows = within(table).getAllByRole("row");
    const cells = within(rows[0]).getAllByRole("cell");
    const editCell = cells[4];

    //Click the "Edit" button for the first person
    const editPerson = within(editCell).getByRole("button", { name: "Edit", });
    fireEvent.click(editPerson);
    const personNameInput = await screen.findByLabelText("User Name");
    await userEvent.clear(personNameInput);
    await userEvent.type(personNameInput, newName.name);  //type in the new name
    const submitButton = screen.getByText("Save");
    await userEvent.click(submitButton);

    expect(createSpy).toHaveBeenCalledWith(updatedPerson);

    const successAlert = await screen.findByText(/Update a Person/);
    expect(successAlert).toBeInTheDocument();
    expect(
      screen.getByText(`'${newName.name}' was successful`)
    ).toBeInTheDocument();

    createSpy.mockRestore();
  });

  it("Should delete a person successfully and show a success alert", async () => {
    await act(async () => {
      render(
        <AppDataContext.Provider value={mockContextValue}>
          <PersonList />
        </AppDataContext.Provider>
      );
    });

    const deletedPerson = mockContextValue.people[0];    
    const createSpy = vi.spyOn(mockContextValue.client.models.Person, 'delete')
    .mockResolvedValue({ data: {id: deletedPerson.id} });

    const table = await screen.findByRole("tablebody");
    const rows = within(table).getAllByRole("row");
    const cells = within(rows[0]).getAllByRole("cell");
    const editCell = cells[3];  //delete button

    //Click the "Delete" button for the first person
    const deletePerson = within(editCell).getByRole("button", { name: "Delete", });
    fireEvent.click(deletePerson);
    const submitButton = screen.getByText("Confirm");
    await userEvent.click(submitButton);

    expect(createSpy).toHaveBeenCalledWith( {id: deletedPerson.id} );

    const successAlert = await screen.findByText(/Delete a Person/);
    expect(successAlert).toBeInTheDocument();
    expect(
      screen.getByText(`'${deletedPerson.name}' was successful`)
    ).toBeInTheDocument();

    createSpy.mockRestore();
  });
});
