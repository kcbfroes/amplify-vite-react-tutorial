import React, { useEffect, useState } from "react";
import { TodoProps, TodoType } from "../Interfaces";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  FormControlLabel,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";

const isValidString = (str?: string): boolean => {
  return !!str && str.trim().length > 0;
};

const TodoTS: React.FC<TodoProps> = ({ title, todo, handleOnClose }) => {
  const [content, setContent] = useState<string>();
  const [isDone, setIsDone] = useState<boolean>();
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setIsDone(checked);
  };
  const [createErrMsg, setCreateErrMsg] = useState<boolean>(false);

  useEffect(() => {
    if (todo) {
      setContent(todo.content);
      const done = todo.isDone ? true : false;
      setIsDone(done);
    } else {
      setContent("");
      setIsDone(false);
    }
  }, [todo]);

  const handleSave = () => {
    if (isValidString(content)) {
      const todoUpdated: Partial<TodoType> = { content, isDone };
      handleOnClose(todoUpdated, false);
    } else {
      setCreateErrMsg(true);
    }
  };
  const handleCancel = () => {
    const emptyTodo: Partial<TodoType> = {};
    handleOnClose(emptyTodo, true);
  };

  return (
    <Dialog open={true} fullWidth maxWidth="sm">
      <Box
        display="flex"
        alignItems="center"
        gap={2}
        bgcolor="#F5F5F5"
        borderBottom={1}
        borderColor="divider"
        padding="20px"
      >
        <Typography variant="h5">{title}</Typography>
        <IconButton
          aria-label="close"
          onClick={handleCancel}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      <DialogContent dividers>
        <Box component="form" noValidate autoComplete="off">
          <Typography variant="body1" gutterBottom fontWeight="bold">
            Description
          </Typography>
          <TextField
            fullWidth
            placeholder="Text input"
            variant="outlined"
            margin="normal"
            value={"" + content}
            onChange={(e) => setContent(e.target.value)}
          />
          <FormControlLabel
            control={
              <Checkbox checked={isDone} onChange={handleCheckboxChange} />
            }
            label="Is it Done?"
          />
        </Box>
        {/* Conditionally render the Box */}
        {createErrMsg && (
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
              Invalid description
            </Typography>
          </Box>
        )}
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
        <Button variant="contained" color="success" onClick={handleSave}>
          {" "}
          {title === "Create New Todo" ? title : "Update"}
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
  );
};

export default TodoTS;
