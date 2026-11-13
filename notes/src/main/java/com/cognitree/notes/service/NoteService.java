package com.cognitree.notes.service;

import com.cognitree.notes.dto.CreateNoteInput;
import com.cognitree.notes.dto.UpdateNoteInput;
import com.cognitree.notes.entity.Note;
import com.cognitree.notes.entity.Tag;
import com.cognitree.notes.exception.NoteNotFoundException;
import com.cognitree.notes.repository.NoteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class NoteService {

    private final NoteRepository noteRepository;

    public NoteService(NoteRepository noteRepository) {
        this.noteRepository = noteRepository;
    }

    // ── Queries ──────────────────────────────────────────────

    public List<Note> getAllNotes() {
        return noteRepository.findAll();
    }

    public Note getNoteById(Long id) {
        return noteRepository.findById(id)
                .orElseThrow(() -> new NoteNotFoundException(id));
    }
    // ── Mutations ────────────────────────────────────────────

    /**
     * Creates a new note and saves it to the DB.
     * The @PrePersist in Note sets createdAt automatically.
     *
     * @param input  the GraphQL CreateNoteInput
     * @param tags   resolved Tag entities (looked up by tagIds in the controller)
     */
    public Note createNote(CreateNoteInput input, List<Tag> tags) {
        Note note = new Note();
        note.setTitle(input.getTitle());
        note.setContent(input.getContent());
        note.setTags(tags);
        return noteRepository.save(note);  // save() triggers @PrePersist → sets createdAt
    }

    /**
     * Partially updates an existing note.
     * Only updates fields that are non-null in the input (PATCH semantics).
     *
     * @param id     the note ID to update
     * @param input  the GraphQL UpdateNoteInput (all fields optional)
     * @param tags   resolved Tag entities, or null if tagIds was not provided
     */
    public Note updateNote(Long id, UpdateNoteInput input, List<Tag> tags) {
        Note note = noteRepository.findById(id)
                .orElseThrow(() -> new NoteNotFoundException(id));

        // Only update fields the client actually sent
        if (input.getTitle() != null) {
            note.setTitle(input.getTitle());
        }
        if (input.getContent() != null) {
            note.setContent(input.getContent());
        }
        if (tags != null) {
            note.setTags(tags);  // replaces all tags
        }

        return noteRepository.save(note);
    }

    /**
     * Deletes a note by ID.
     * Returns true on success (matches schema: deleteNote: Boolean!)
     */
    public boolean deleteNote(Long id) {
        if (!noteRepository.existsById(id)) {
            throw new NoteNotFoundException(id);
        }
        noteRepository.deleteById(id);
        return true;
    }
}