import { TodoDeleteConfirmProps } from "../Interfaces";
import CloseIcon from "@mui/icons-material/Close";
import {
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
  Box,
} from "@mui/material";
import React from "react";

export default function TodoDeleteConfirm(props: TodoDeleteConfirmProps) {
  const [deleteVar, setDeleteVar] = React.useState<string>("");
  const [errorMsg, setErrorMsg] = React.useState<boolean>(false);

  const handleDelete = () => {
    const lowerCaseDelete = deleteVar.toLowerCase();
    if (lowerCaseDelete === "delete") {
      props.deleteTodo(props.todo);
      props.close(true);
    } else {
      if (!errorMsg) {
        // error message is not shown yet
        setErrorMsg(true);
      }
    }
  };

  const handleCancel = () => {
    props.close(true);
  };

  return (
    <Dialog
      open={true}
      maxWidth="sm"
      fullWidth
      sx={{
        "& .css-10bxh4q-MuiDialogContent-root": {
          padding: "0px",
        },
      }}
    >
      <Box
        display="flex"
        alignItems="center"
        gap={2}
        bgcolor="#F5F5F5"
        borderBottom={1}
        borderColor="divider"
        padding="20px"
      >
        <Typography variant="h5" component="div" flex={1}>
          Delete this Todo?
        </Typography>
        <IconButton
          size="small"
          sx={{ bgcolor: "#0a0a0a33", borderRadius: "50%" }}
          onClick={handleCancel}
        >
          <CloseIcon sx={{ color: "white" }} />
        </IconButton>
      </Box>
      <DialogContent dividers>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
          gap={3}
          padding="20px"
          bgcolor="background.paper"
        >
          <Typography
            variant="h5"
            color="textPrimary"
            sx={{
              fontWeight: "bold",
            }}
          >
            {props.todo?.content}
          </Typography>
          <Box display="flex" flexDirection="column" width="100%">
            <Typography variant="body1" color="textPrimary">
              To delete this Todo type ‘delete’
            </Typography>
            <TextField
              placeholder="delete"
              variant="outlined"
              fullWidth
              margin="normal"
              value={"" + deleteVar}
              onChange={(e) => setDeleteVar(e.target.value)}
              InputProps={{
                style: { color: "red", fontStyle: "italic" },
              }}
            />
          </Box>
          {/* Conditionally render the Box */}
          {errorMsg && (
            <Box
              display="flex"
              alignItems="flex-start"
              gap={2.5}
              pl="24px"
              pr="40px"
              py="20px"
              position="relative"
              bgcolor="#FEECF0"
              borderRadius={1}
            >
              <Typography variant="body2" color="error" sx={{ flexGrow: 1 }}>
                You need to type 'delete' to complete this action.
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      <Box
        display="flex"
        alignItems="start"
        gap={2}
        padding="20px"
        position="relative"
        bgcolor="#F5F5F5"
        borderTop={1}
        borderColor="divider"
      >
        <Button
          variant="contained"
          color="error"
          onClick={handleDelete}
          sx={{ flex: "0 0 auto " }}
        >
          Delete
        </Button>
        <Button
          variant="outlined"
          onClick={handleCancel}
          sx={{
            flex: "0 0 auto ",
            backgroundColor: "white",
            "&:hover": {
              backgroundColor: "#D7D6D6", // Change color on hover
            },
          }}
        >
          Cancel
        </Button>
      </Box>
    </Dialog>

    /*<div>
            <Card variation='elevated'>
                <h2>Delete this To Do?</h2>
                <h3>{props.todo?.content}</h3>
            </Card>
            <Flex direction='row' gap='20px'>
                <Button onClick={handleConfirm}>Confirm</Button>
                <Button variation='primary' onClick={handleCancel}>Close</Button>
            </Flex>
        </div>*/
  );
}
