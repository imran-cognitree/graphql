import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DeleteOutlined from '@mui/icons-material/DeleteOutlined';
import EditOutlined from '@mui/icons-material/EditOutlined';
import type { Note } from '../../types/note';
import { formatHumanDate } from '../../utils/date';
import { truncateText } from '../../utils/text';

interface NoteCardProps {
  note: Note;
  onView: (note: Note) => void;
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
}

export default function NoteCard({ note, onView, onEdit, onDelete }: NoteCardProps) {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'box-shadow 0.2s',
        '&:hover': { boxShadow: 6 },
      }}
    >
      <CardActionArea onClick={() => onView(note)} sx={{ flexGrow: 1, alignItems: 'flex-start' }}>
        <CardContent sx={{ pb: 0 }}>
          <Typography variant="h6" noWrap gutterBottom>
            {note.title}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }} gutterBottom>
            {formatHumanDate(note.createdAt)}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 1, minHeight: 40 }}
          >
            {truncateText(note.content, 100)}
          </Typography>
          {note.tags.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {note.tags.map((tag) => (
                <Chip key={tag.id} label={tag.name} size="small" variant="outlined" />
              ))}
            </Box>
          )}
        </CardContent>
      </CardActionArea>

      <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
        <IconButton
          size="small"
          aria-label="edit note"
          onClick={(e) => { e.stopPropagation(); onEdit(note); }}
        >
          <EditOutlined fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          color="error"
          aria-label="delete note"
          onClick={(e) => { e.stopPropagation(); onDelete(note); }}
        >
          <DeleteOutlined fontSize="small" />
        </IconButton>
      </CardActions>
    </Card>
  );
}
