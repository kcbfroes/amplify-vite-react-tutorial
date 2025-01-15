{
  /*import React from "react";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";

interface ModalProps{
    handleCancel: () => void;
    handleSave: () => void;
    setContent: (content: string) => void;
    setIsDone: (isDone: boolean) => void;
}

const Modal: React.FC<ModalProps> = ({ handleCancel, handleSave, setContent, setIsDone}) => {
    const [isDone, updateIsDone] = React.useState(false);
    const [newContent, updateNewContent] = React.useState("");
    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const checked = event.target.checked;
        updateIsDone(checked);
        setIsDone(checked); //update via parent prop
    }
    const handleNewTodo = () => {
        setContent(newContent);
        console.log("New Content: ", newContent)
        handleSave();
    }

  return (
    <Dialog open={true} onClose={(handleCancel) => {}} fullWidth maxWidth="sm">
      <DialogTitle>
        <Typography variant="h6">Create New ToDo</Typography>
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
      </DialogTitle>
      <DialogContent dividers>
        <Box component="form" noValidate autoComplete="off">
          <Typography variant="body1" gutterBottom>
            Description
          </Typography>
          <TextField
            fullWidth
            placeholder="Text input"
            variant="outlined"
            margin="normal"
            value={'' + newContent}
            onChange={(e) => updateNewContent(e.target.value)}
          />
          <FormControlLabel 
            control={
            <Checkbox 
                checked={isDone}
                onChange={handleCheckboxChange}
            />} label="Is it Done?" />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button 
            variant="contained"
            color="success"
            onClick={handleNewTodo}
        > Create ToDo
        </Button>
        <Button 
            variant="outlined"
            onClick={handleCancel}
        >Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Modal;*/
}
