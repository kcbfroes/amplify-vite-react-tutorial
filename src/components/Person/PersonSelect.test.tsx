import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import PersonSelect from "./PersonSelect";
import { AppDataContext } from "../../context/AppDataContext";
import { FakePeople } from "../../Test/FakeData";

/*
Full disclosure: I had ChatGPT4o generate this file for me.
I had to fix some things that did work around the mockContextValue and,
it didn't run at first, but with a few tweeks (with assistance, of course, from AI) it now does.
*/

describe("PersonSelect Component", () => {
  const mockHandleOnClose = vi.fn();

  const mockContextValue = {
    client: null,
    todos: [],
    people: FakePeople(),
    allDataSynced: true,
  };

  it("renders the Autocomplete component and buttons", () => {
    render(
      <AppDataContext.Provider value={mockContextValue}>
        <PersonSelect
          label="Select a Person"
          handleOnClose={mockHandleOnClose}
        />
      </AppDataContext.Provider>
    );

    // Verify the autocomplete component renders
    expect(screen.getByLabelText(/select a person/i)).toBeInTheDocument();

    // Verify the buttons render
    expect(screen.getByRole("button", { name: /select/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /close/i })).toBeInTheDocument();
  });

  it("filters the autocomplete options based on input", () => {
    render(
      <AppDataContext.Provider value={mockContextValue}>
        <PersonSelect
          label="Select a Person"
          handleOnClose={mockHandleOnClose}
        />
      </AppDataContext.Provider>
    );

    const autocomplete = screen.getByLabelText(/select a person/i);

    fireEvent.change(autocomplete, { target: { value: "Person B" } });

    expect(screen.getByText("Person B")).toBeInTheDocument();
    expect(screen.queryByText("Person A")).not.toBeInTheDocument();
  });

  it("selects a person and calls handleOnClose with the selectedId", () => {
    render(
      <AppDataContext.Provider value={mockContextValue}>
        <PersonSelect
          label="Select a Person"
          handleOnClose={mockHandleOnClose}
        />
      </AppDataContext.Provider>
    );

    const autocomplete = screen.getByLabelText(/select a person/i);

    fireEvent.change(autocomplete, { target: { value: "Person C" } });

    // Simulate selecting the person that comes up in the list
    const option = screen.getByText("Person C");
    fireEvent.click(option);

    // Click the select button
    fireEvent.click(screen.getByRole("button", { name: /select/i }));

    // Expect handleOnClose to have been called with the PersonId
    expect(mockHandleOnClose).toHaveBeenCalledWith("P3");
  });

  it("calls handleOnClose with an empty string when canceled", () => {
    render(
      <AppDataContext.Provider value={mockContextValue}>
        <PersonSelect
          label="Select a Person"
          handleOnClose={mockHandleOnClose}
        />
      </AppDataContext.Provider>
    );

    // Click the close button
    fireEvent.click(screen.getByText(/close/i));

    // Expect handleOnClose to have been called with an empty string
    expect(mockHandleOnClose).toHaveBeenCalledWith("");
  });
});
