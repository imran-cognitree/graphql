import { useState } from 'react';
import MainLayout from './components/layout/MainLayout';
import NotesCatalog from './components/notes/NotesCatalog';
import NoteFormModal from './components/notes/NoteFormModal';

export default function App() {
  const [createModalOpen, setCreateModalOpen] = useState(false);

  return (
    <MainLayout
      onNotesClick={() => { }}
      onCreateClick={() => setCreateModalOpen(true)}
    >
      <NotesCatalog onOpenCreateModal={() => setCreateModalOpen(true)} />

      <NoteFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </MainLayout>
  );
}
