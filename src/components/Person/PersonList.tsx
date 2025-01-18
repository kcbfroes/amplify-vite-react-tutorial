import PersonTS from "./PersonTS";
import { GraphQLFormattedError, PersonType } from "../Interfaces";
import {
  Table,
  TableCell,
  TableBody,
  TableHead,
  TableRow,
  Flex,
  AlertVariations,
  Alert,
  Button,
  useTheme,
} from "@aws-amplify/ui-react";
import { useContext, useEffect, useState } from "react";
import Modal from "../Modal";
import PersonDeleteConfirm from "./PersonDeleteConfirm";
import { AppDataContext } from "../../context/AppDataContext";

export default function PersonList() {
  const context = useContext(AppDataContext);
  if (!context) throw new Error("AppContext is not available");
  const { people, client } = context;

  const { tokens } = useTheme();

  //Alerts
  const [alertHeading, setAlertHeading] = useState("");
  const [alertMsg, setAlertMsg] = useState("");
  const [alertVariation, setAlertVariation] = useState<AlertVariations>("info");
  const [alertVisible, setAlertVisible] = useState(false);

  //All other
  const [person, setPerson] = useState<PersonType>(); //useState<PersonType>() makes "person" a type: PersonType | underfined
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    console.log("PersonList: People updated:", people);
  }, [people]);

  //------------------------------ Create ------------------------------
  const newPerson = () => {
    if (createOpen) {
      return (
        <Modal>
          <PersonTS handleOnClose={createPerson} />
        </Modal>
      );
    } else {
      return <></>;
    }
  };
  const createPerson = (aPerson: Partial<PersonType>, cancelled: boolean) => {
    if (!cancelled) {
      const key: string = "" + aPerson.name;
      client.models.Person.create({ name: "" + aPerson.name })
        .then((result: any) => handleResult(result, "Create a Person", key))
        .catch((error: GraphQLFormattedError[]) =>
          handleError(error, "Create a Person", key)
        );
    }
    setCreateOpen(false);
  };

  //------------------------------ Edit/Update ------------------------------
  const editPerson = (person: PersonType) => {
    setPerson(person);
    setEditOpen(true);
  };
  const editPersonClose = (
    personUpdated: Partial<PersonType>,
    cancelled: boolean
  ) => {
    setEditOpen(false);
    if (cancelled == false) {
      const mergedPerson: PersonType = Object.assign({}, person, personUpdated);
      updatePerson(mergedPerson);
    }
  };
  const ShowEditPopup = () => {
    if (editOpen == true) {
      return (
        <Modal>
          <PersonTS person={person} handleOnClose={editPersonClose} />
        </Modal>
      );
    } else {
      return <></>;
    }
  };
  const updatePerson = (person: PersonType) => {
    const key: string = person.name;
    client.models.Person.update(person)
      .then((result: any) => handleResult(result, "Update a Person", key))
      .catch((error: GraphQLFormattedError[]) =>
        handleError(error, "Update a Person: ", key)
      );
  };

  //------------------------------ Delete ------------------------------
  const confirmDelete = (person: PersonType) => {
    setPerson(person);
    setModalOpen(true);
  };
  const closeDeleteConfirm = () => {
    setModalOpen(false);
  };
  const showDeleteConfirm = () => {
    if (modalOpen && person) {
      return (
        <Modal>
          <PersonDeleteConfirm
            person={person}
            close={closeDeleteConfirm}
            deletePerson={deletePerson}
          />
        </Modal>
      );
    } else {
      return <></>;
    }
  };
  const deletePerson = (deletePerson: PersonType) => {
    const key: string = deletePerson.name;
    client.models.Person.delete({ id: deletePerson.id })
      .then((result: any) => handleResult(result, "Delete a Person", key))
      .catch((error: GraphQLFormattedError[]) =>
        handleError(error, "Delete", key)
      );
  };

  //------------------------------ Handle Person Actions ------------------------------
  const handleResult = (result: any, header: string, key: string) => {
    if (result.errors) {
      handleError(result.errors, header, key);
    } else {
      setAlertVisible(true);
      setAlertHeading(header);
      setAlertVariation("success");
      setAlertMsg("'" + key + "' was successful");
    }
  };
  const handleError = (
    errors: Array<GraphQLFormattedError>,
    header: string,
    key: string
  ) => {
    var allErrors: string = "";
    for (const err of errors) {
      allErrors += "'" + key + "' -->" + err.message;
    }
    setAlertVisible(true);
    setAlertHeading(header + " Unexpeceted Error");
    setAlertVariation("error");
    setAlertMsg(allErrors);
  };

  const showAlerts = () => {
    if (alertVisible) {
      return (
        <Alert
          hidden={false}
          variation={alertVariation}
          isDismissible={true}
          hasIcon={true}
          heading={alertHeading}
          onDismiss={() => {
            setAlertVisible(false);
            setAlertMsg("");
          }}
        >
          {alertMsg}
        </Alert>
      );
    } else {
      return <></>;
    }
  };

  return (
    <div>
      <Flex direction="column" backgroundColor={tokens.colors.blue[20]}>
        <Flex direction="row">
          <Button
            onClick={() => {
              setCreateOpen(true);
            }}
            variation="link"
          >
            Create Person
          </Button>
        </Flex>

        {newPerson()}

        <Table variation="bordered">
          <TableHead>
            <TableRow>
              <TableCell as="th">Name</TableCell>
              <TableCell as="th" style={{ textAlign: "center" }}>
                Owned To Dos
              </TableCell>
              <TableCell as="th" style={{ textAlign: "center" }}>
                Assigned To Dos
              </TableCell>
              <TableCell
                colSpan={2}
                style={{ textAlign: "center", verticalAlign: "middle" }}
                as="th"
              >
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody role="tablebody">
            {people.map((person: PersonType) => (
              <TableRow role="row" key={person.id} data-person-id={person.id}>
                <TableCell role="cell">{person.name}</TableCell>
                <TableCell role="cell" style={{ textAlign: "center" }}>
                  {person.ownedTodos.length}
                </TableCell>
                <TableCell role="cell" style={{ textAlign: "center" }}>
                  {person.assignedTodos.length}
                </TableCell>
                <TableCell role="cell">
                  <Button
                    onClick={() => confirmDelete(person)}
                    variation="link"
                  >
                    Delete
                  </Button>
                </TableCell>
                <TableCell role="cell">
                  <Button onClick={() => editPerson(person)} variation="link">
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {ShowEditPopup()}
        {showDeleteConfirm()}

        <div>{showAlerts()}</div>
      </Flex>
    </div>
  );
}
