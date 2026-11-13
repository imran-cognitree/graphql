import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseOutlined from '@mui/icons-material/CloseOutlined';
import EditOutlined from '@mui/icons-material/EditOutlined';
import type { Note } from '../../types/note';
import { formatHumanDate } from '../../utils/date';

interface NoteViewModalProps {
  note: Note | null;
  open: boolean;
  onClose: () => void;
  onEdit: (note: Note) => void;
}

export default function NoteViewModal({ note, open, onClose, onEdit }: NoteViewModalProps) {
  if (!note) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', pr: 1 }}
      >
        <span>{note.title}</span>
        <IconButton aria-label="close" onClick={onClose} size="small">
          <CloseOutlined />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }} gutterBottom>
          {formatHumanDate(note.createdAt)}
        </Typography>

        {note.tags.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
            {note.tags.map((tag) => (
              <Chip key={tag.id} label={tag.name} size="small" variant="outlined" />
            ))}
          </Box>
        )}

        <Divider sx={{ mb: 2 }} />

        <Typography
          variant="body1"
          sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}
          color={note.content ? 'text.primary' : 'text.disabled'}
        >
          {note.content || 'No content.'}
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button
          startIcon={<EditOutlined />}
          onClick={() => { onEdit(note); onClose(); }}
        >
          Edit
        </Button>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
