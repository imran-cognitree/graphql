import { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import type { Note } from '../../types/note';
import { GET_NOTES } from '../../graphql/queries';
import NoteCard from './NoteCard';
import NoteViewModal from './NoteViewModal';
import NoteFormModal from './NoteFormModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import EmptyState from '../common/EmptyState';
import LoadingSkeletons from '../common/LoadingSkeletons';

interface NotesCatalogProps {
  onOpenCreateModal: () => void;
}

export default function NotesCatalog({ onOpenCreateModal }: NotesCatalogProps) {
  const { loading, error, data } = useQuery<{ notes: Note[] }>(GET_NOTES);

  const [viewNote, setViewNote] = useState<Note | null>(null);
  const [editNote, setEditNote] = useState<Note | null>(null);
  const [deleteNote, setDeleteNote] = useState<Note | null>(null);

  if (loading) return <LoadingSkeletons />;

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Failed to load notes: {error.message}
      </Alert>
    );
  }

  const notes = data?.notes ?? [];

  if (notes.length === 0) {
    return <EmptyState onCreateClick={onOpenCreateModal} />;
  }

  return (
    <>
      <Grid container spacing={3}>
        {notes.map((note) => (
          <Grid key={note.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <NoteCard
              note={note}
              onView={setViewNote}
              onEdit={setEditNote}
              onDelete={setDeleteNote}
            />
          </Grid>
        ))}
      </Grid>

      <NoteViewModal
        note={viewNote}
        open={Boolean(viewNote)}
        onClose={() => setViewNote(null)}
        onEdit={(n) => { setEditNote(n); setViewNote(null); }}
      />

      <NoteFormModal
        open={Boolean(editNote)}
        onClose={() => setEditNote(null)}
        note={editNote}
      />

      <DeleteConfirmModal
        open={Boolean(deleteNote)}
        onClose={() => setDeleteNote(null)}
        note={deleteNote}
      />
    </>
  );
}
