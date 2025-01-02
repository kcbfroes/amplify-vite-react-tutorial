import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import TodoDeleteConfirm from "./TodoDeleteConfirm";
import { TodoDeleteConfirmProps } from "../Interfaces";

//Generated by ChatGPT with no problems

describe("TodoDeleteConfirm Component", () => {
  it("renders the content of the todo correctly", () => {
    const mockTodo = { id: "1", content: "Test Todo" };
    const mockClose = vi.fn();
    const mockDeleteTodo = vi.fn();

    const props: TodoDeleteConfirmProps = {
      todo: mockTodo,
      close: mockClose,
      deleteTodo: mockDeleteTodo,
    };

    render(<TodoDeleteConfirm {...props} />);

    // Verify the title and todo content are rendered
    expect(screen.getByText(/Delete this To Do\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Test Todo/i)).toBeInTheDocument();
  });

  it("calls deleteTodo and close when Confirm is clicked", () => {
    const mockTodo = { id: "1", content: "Test Todo" };
    const mockClose = vi.fn();
    const mockDeleteTodo = vi.fn();

    const props: TodoDeleteConfirmProps = {
      todo: mockTodo,
      close: mockClose,
      deleteTodo: mockDeleteTodo,
    };

    render(<TodoDeleteConfirm {...props} />);

    const confirmButton = screen.getByText(/Confirm/i);

    // Simulate clicking the Confirm button
    fireEvent.click(confirmButton);

    // Verify the deleteTodo and close functions are called
    expect(mockDeleteTodo).toHaveBeenCalledWith(mockTodo);
    expect(mockClose).toHaveBeenCalledWith(true);
  });

  it("calls close when Close is clicked", () => {
    const mockTodo = { id: "1", content: "Test Todo" };
    const mockClose = vi.fn();
    const mockDeleteTodo = vi.fn();

    const props: TodoDeleteConfirmProps = {
      todo: mockTodo,
      close: mockClose,
      deleteTodo: mockDeleteTodo,
    };

    render(<TodoDeleteConfirm {...props} />);

    const closeButton = screen.getByText(/Close/i);

    // Simulate clicking the Close button
    fireEvent.click(closeButton);

    // Verify the close function is called
    expect(mockClose).toHaveBeenCalledWith(true);
    // Ensure deleteTodo is not called
    expect(mockDeleteTodo).not.toHaveBeenCalled();
  });
});
