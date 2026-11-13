import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import type { Note, Tag, CreateNoteInput, UpdateNoteInput } from '../../types/note';
import { GET_NOTES, GET_TAGS } from '../../graphql/queries';
import { CREATE_NOTE, UPDATE_NOTE, CREATE_TAG } from '../../graphql/mutations';

interface NoteFormModalProps {
  open: boolean;
  onClose: () => void;
  note?: Note | null;
}

type TagOption = Tag | string;
const filter = createFilterOptions<TagOption>();

export default function NoteFormModal({ open, onClose, note }: NoteFormModalProps) {
  const isEditMode = Boolean(note);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

  const { data: tagsData } = useQuery<{ tags: Tag[] }>(GET_TAGS);
  const [createNote, { loading: creating }] = useMutation<
    { createNote: Note },
    { input: CreateNoteInput }
  >(CREATE_NOTE, {
    refetchQueries: [{ query: GET_NOTES }],
  });
  const [updateNote, { loading: updating }] = useMutation<
    { updateNote: Note },
    { id: string; input: UpdateNoteInput }
  >(UPDATE_NOTE, {
    refetchQueries: [{ query: GET_NOTES }],
  });
  const [createTag] = useMutation<
    { createTag: Tag },
    { name: string }
  >(CREATE_TAG, {
    refetchQueries: [{ query: GET_TAGS }],
  });

  const loading = creating || updating;
  const availableTags: Tag[] = tagsData?.tags ?? [];

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content ?? '');
      setSelectedTags(note.tags);
    } else {
      setTitle('');
      setContent('');
      setSelectedTags([]);
    }
  }, [note, open]);

  const handleSave = async () => {
    const tagIds = selectedTags.map((t) => t.id);
    if (isEditMode && note) {
      await updateNote({ variables: { id: note.id, input: { title, content, tagIds } } });
    } else {
      await createNote({ variables: { input: { title, content, tagIds } } });
    }
    onClose();
  };

  const handleTagChange = async (_: unknown, newValue: TagOption[]) => {
    const resolved: Tag[] = [];
    for (const val of newValue) {
      if (typeof val === 'string') {
        const result = await createTag({ variables: { name: val } });
        if (result.data?.createTag) {
          resolved.push(result.data.createTag);
        }
      } else {
        resolved.push(val);
      }
    }
    setSelectedTags(resolved);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEditMode ? 'Edit Note' : 'Create Note'}</DialogTitle>

      <DialogContent>
        <TextField
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          required
          autoFocus={!isEditMode}
          margin="normal"
          slotProps={{ htmlInput: { maxLength: 255 } }}
        />

        <TextField
          label="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          fullWidth
          multiline
          rows={6}
          margin="normal"
        />

        <Autocomplete<TagOption, true, false, true>
          multiple
          freeSolo
          options={availableTags}
          getOptionLabel={(option) => (typeof option === 'string' ? option : option.name)}
          isOptionEqualToValue={(option, value) => {
            if (typeof option === 'string' || typeof value === 'string') return false;
            return option.id === value.id;
          }}
          value={selectedTags}
          onChange={handleTagChange}
          filterOptions={(options, params) => {
            const filtered = filter(options, params);
            const { inputValue } = params;
            const isExisting = options.some(
              (opt) => typeof opt !== 'string' && opt.name === inputValue
            );
            if (inputValue !== '' && !isExisting) {
              filtered.push(inputValue);
            }
            return filtered;
          }}
          renderValue={(value, getItemProps) =>
            value.map((option, index) => {
              const label = typeof option === 'string' ? option : option.name;
              const { key, ...itemProps } = getItemProps({ index });
              return <Chip key={key} label={label} size="small" {...itemProps} />;
            })
          }
          renderInput={(params) => (
            <TextField {...params} label="Tags" margin="normal" placeholder="Select or type to add..." />
          )}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!title.trim() || loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
