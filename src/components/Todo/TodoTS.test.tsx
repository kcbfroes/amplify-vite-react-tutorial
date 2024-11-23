import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import TodoTS from "./TodoTS";
import { TodoProps, TodoType } from "../Interfaces";

describe("TodoTS Component", () => {
  it("renders the initial todo content correctly", () => {
    const mockTodo: TodoType = { id: "1", content: "Sample Todo", isDone: false };
    const mockHandleOnClose = vi.fn();

    const props: TodoProps = {
      todo: mockTodo,
      handleOnClose: mockHandleOnClose,
    };

    render(<TodoTS {...props} />);

    // Verify the TextField contains the correct initial value
    const textField = screen.getByLabelText(/description/i) as HTMLInputElement;
    expect(textField.value).toBe(mockTodo.content);

    // Verify the CheckboxField is unchecked
    const checkbox = screen.getByLabelText(/is done\?/i) as HTMLInputElement;
    expect(checkbox.checked).toBe(mockTodo.isDone);
  });

  it("updates state when inputs are changed", () => {
    const mockTodo: TodoType = { id: "1", content: "Sample Todo", isDone: false };
    const mockHandleOnClose = vi.fn();

    const props: TodoProps = {
      todo: mockTodo,
      handleOnClose: mockHandleOnClose,
    };

    render(<TodoTS {...props} />);

    const textField = screen.getByLabelText(/description/i) as HTMLInputElement;
    const checkbox = screen.getByLabelText(/is done\?/i) as HTMLInputElement;

    // Change the text field
    fireEvent.change(textField, { target: { value: "Updated Todo" } });
    expect(textField.value).toBe("Updated Todo");

    // Toggle the checkbox
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);
  });

  it("calls handleOnClose with updated todo when Save is clicked", () => {
    const mockTodo: TodoType = { id: "1", content: "Sample Todo", isDone: false };
    const mockHandleOnClose = vi.fn();

    const props: TodoProps = {
      todo: mockTodo,
      handleOnClose: mockHandleOnClose,
    };

    render(<TodoTS {...props} />);

    const textField = screen.getByLabelText(/description/i) as HTMLInputElement;
    const checkbox = screen.getByLabelText(/is done\?/i) as HTMLInputElement;
    const saveButton = screen.getByText(/save/i);

    // Update inputs
    fireEvent.change(textField, { target: { value: "Updated Todo" } });
    fireEvent.click(checkbox);

    // Click the Save button
    fireEvent.click(saveButton);

    // Verify handleOnClose is called with the updated todo
    expect(mockHandleOnClose).toHaveBeenCalledWith(
      { content: "Updated Todo", isDone: true },
      false
    );
  });

  it("calls handleOnClose with an empty object when Cancel is clicked", () => {
    const mockTodo: TodoType = { id: "1", content: "Sample Todo", isDone: false };
    const mockHandleOnClose = vi.fn();

    const props: TodoProps = {
      todo: mockTodo,
      handleOnClose: mockHandleOnClose,
    };

    render(<TodoTS {...props} />);

    const cancelButton = screen.getByText(/cancel/i);

    // Click the Cancel button
    fireEvent.click(cancelButton);

    // Verify handleOnClose is called with an empty object and cancelled flag
    expect(mockHandleOnClose).toHaveBeenCalledWith({}, true);
  });
});
