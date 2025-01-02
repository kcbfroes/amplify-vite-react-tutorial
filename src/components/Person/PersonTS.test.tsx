import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import PersonTS from "./PersonTS";
import { PersonProps } from "../Interfaces";

/*
Full disclosure: I had ChatGPT4o generate this file for me.
It did not get the "const props: PersonProps" right but that was easy to fix.
All tests passed with that one little fix.
*/

describe("PersonTS Component", () => {
  it("renders correctly with no initial person", () => {
    const mockHandleOnClose = vi.fn();
    const props: PersonProps = { person: undefined, handleOnClose: mockHandleOnClose };

    render(<PersonTS {...props} />);

    // Verify that the input field is rendered and empty
    const textField = screen.getByLabelText(/User Name/i);
    expect(textField).toBeInTheDocument();
    expect((textField as HTMLInputElement).value).toBe("");

    // Verify that buttons are rendered
    expect(screen.getByText(/Cancel/i)).toBeInTheDocument();
    expect(screen.getByText(/Save/i)).toBeInTheDocument();
  });

  it("renders correctly with an initial person", () => {
    const mockHandleOnClose = vi.fn();
    const props: PersonProps = { person: { id: "1", name: "John Doe", ownedTodos: [], assignedTodos: [] }, handleOnClose: mockHandleOnClose };

    render(<PersonTS {...props} />);

    // Verify that the input field is rendered and pre-filled
    const textField = screen.getByLabelText(/User Name/i);
    expect((textField as HTMLInputElement).value).toBe("John Doe");
  });

  it("updates name when typing in the input field", () => {
    const mockHandleOnClose = vi.fn();
    const props: PersonProps = { person: { id: "1", name: "Jane Doe", ownedTodos: [], assignedTodos: [] }, handleOnClose: mockHandleOnClose };

    render(<PersonTS {...props} />);

    const textField = screen.getByLabelText(/User Name/i);

    // Simulate typing into the input field
    fireEvent.change(textField, { target: { value: "Jane Doe" } });
    expect((textField as HTMLInputElement).value).toBe("Jane Doe");
  });

  it("calls handleOnClose with updated name on Save", () => {
    const mockHandleOnClose = vi.fn();
    const props: PersonProps = { person: { id: "1", name: "John Doe", ownedTodos: [], assignedTodos: [] }, handleOnClose: mockHandleOnClose };

    render(<PersonTS {...props} />);

    const textField = screen.getByLabelText(/User Name/i);
    const saveButton = screen.getByText(/Save/i);

    // Simulate typing into the input field
    fireEvent.change(textField, { target: { value: "Jane Doe" } });

    // Simulate clicking the Save button
    fireEvent.click(saveButton);

    // Verify that handleOnClose was called with the updated name and cancelled = false
    expect(mockHandleOnClose).toHaveBeenCalledWith({ name: "Jane Doe" }, false);
  });

  it("calls handleOnClose with an empty person and cancelled = true on Cancel", () => {
    const mockHandleOnClose = vi.fn();
    const props: PersonProps = { person: { id: "1", name: "John Doe", ownedTodos: [], assignedTodos: [] }, handleOnClose: mockHandleOnClose };

    render(<PersonTS {...props} />);

    const cancelButton = screen.getByText(/Cancel/i);

    // Simulate clicking the Cancel button
    fireEvent.click(cancelButton);

    // Verify that handleOnClose was called with an empty object and cancelled = true
    expect(mockHandleOnClose).toHaveBeenCalledWith({}, true);
  });
});
