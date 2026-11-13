import { useMutation } from '@apollo/client/react';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import type { Note } from '../../types/note';
import { DELETE_NOTE } from '../../graphql/mutations';
import { GET_NOTES } from '../../graphql/queries';

interface DeleteConfirmModalProps {
  open: boolean;
  onClose: () => void;
  note: Note | null;
}

export default function DeleteConfirmModal({ open, onClose, note }: DeleteConfirmModalProps) {
  const [deleteNote, { loading }] = useMutation(DELETE_NOTE, {
    refetchQueries: [{ query: GET_NOTES }],
  });

  const handleDelete = async () => {
    if (!note) return;
    await deleteNote({ variables: { id: note.id } });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Delete Note</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete &ldquo;<strong>{note?.title}</strong>&rdquo;? This action
          cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          color="error"
          variant="contained"
          onClick={handleDelete}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {loading ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
