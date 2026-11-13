import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import NoteAddOutlined from '@mui/icons-material/NoteAddOutlined';

interface EmptyStateProps {
  onCreateClick: () => void;
}

export default function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: 2,
      }}
    >
      <NoteAddOutlined sx={{ fontSize: 72, color: 'text.disabled' }} />
      <Typography variant="h5" color="text.secondary">
        No notes yet
      </Typography>
      <Typography variant="body2" color="text.disabled">
        Create your first note to get started
      </Typography>
      <Button variant="contained" onClick={onCreateClick} sx={{ mt: 1 }}>
        Create Note
      </Button>
    </Box>
  );
}
