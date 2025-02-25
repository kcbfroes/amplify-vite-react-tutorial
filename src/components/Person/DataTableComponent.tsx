import $ from "jquery";
import DataTable from "datatables.net";
import "datatables.net-bulma";
import "datatables.net-searchpanes";
import PersonTS from "./PersonTS";
import { GraphQLFormattedError, PersonType } from "../Interfaces";
import { useContext, useEffect, useState, useRef } from "react";
import Modal from "../Modal";
import PersonDeleteConfirm from "./PersonDeleteConfirm";
import { AppDataContext } from "../../context/AppDataContext";

interface DataTableProps {
  editPerson: (person: PersonType) => void;
  confirmDelete: (person: PersonType) => void;
}

const DataTableComponent: React.FC<DataTableProps> = ({
  editPerson,
  confirmDelete,
}) => {
  // Create a reference to the table element
  const tableRef = useRef<HTMLTableElement | null>(null);
  const context = useContext(AppDataContext);
  if (!context) throw new Error("AppContext is not available");
  const { people } = context;

  useEffect(() => {
    if (tableRef.current) {
      // Initialize DataTables only if the ref is attached
      const table = $(tableRef.current).DataTable({
        destroy: true, // Allows re-initialization
        retrieve: true, // Ensures existing table is used
      });

      // Clear the table before repopulating
      table.clear();

      // Populate table with dynamic data
      people.forEach((person) => {
        table.row.add([
          person.name,
          person.ownedTodos.length.toString(),
          person.assignedTodos.length.toString(),
          `<button class="button is-danger is-small delete-btn" data-id="${person.id}">Delete</button>`,
          `<button class="button is-link is-small edit-btn" data-id="${person.id}">Edit</button>`,
        ]);
      });

      // Redraw table with new data
      table.draw();

      // Handle delete and edit button clicks
      $(".delete-btn").on("click", function () {
        const personId = $(this).data("id");
        const person = people.find((p) => p.id === personId);
        if (person) confirmDelete(person);
      });

      $(".edit-btn").on("click", function () {
        const personId = $(this).data("id");
        const person = people.find((p) => p.id === personId);
        if (person) editPerson(person);
      });

      return () => {
        table.destroy();
      };
    }
  }, [people, confirmDelete, editPerson]);

  return (
    <table ref={tableRef} className="table is-striped is-fullwidth">
      <thead>
        <tr>
          <th>Name</th>
          <th>Owned To Dos</th>
          <th>Assigned To Dos</th>
          <th colSpan={2} style={{ textAlign: "center" }}>
            Action
          </th>
        </tr>
      </thead>
      <tbody>{/* Table rows will be dynamically rendered here */}</tbody>
    </table>
  );
};

export default DataTableComponent;
