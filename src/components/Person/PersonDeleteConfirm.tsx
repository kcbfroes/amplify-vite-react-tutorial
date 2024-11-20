import { Button, Card, Flex } from "@aws-amplify/ui-react";
import { PersonDeleteConfirmProps } from "../Interfaces";

export default function PersonDeleteConfirm(props: PersonDeleteConfirmProps) {
  const handleConfirm = () => {
    props.deletePerson(props.person);
    props.close(true);
  };
  const handleCancel = () => {
    props.close(true);
  };

  return (
    <div>
      <Card variation="elevated">
        <h2>Delete this Person?</h2>
        <h3>{props.person?.name}</h3>
      </Card>
      <Flex direction="row" gap="20px">
        <Button onClick={handleConfirm}>Confirm</Button>
        <Button variation="primary" onClick={handleCancel}>
          Close
        </Button>
      </Flex>
    </div>
  );
}
