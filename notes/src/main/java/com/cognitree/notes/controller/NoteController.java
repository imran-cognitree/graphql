package com.cognitree.notes.controller;

import com.cognitree.notes.dto.CreateNoteInput;
import com.cognitree.notes.dto.UpdateNoteInput;
import com.cognitree.notes.entity.Note;
import com.cognitree.notes.entity.Tag;
import com.cognitree.notes.repository.TagRepository;
import com.cognitree.notes.service.NoteService;
import java.util.List;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.stereotype.Controller;

@Controller
public class NoteController {

    private final NoteService noteService;
    private final TagRepository tagRepository;

    public NoteController(NoteService noteService, TagRepository tagRepository) {
        this.noteService = noteService;
        this.tagRepository = tagRepository;
    }

    // ── Query Resolvers ──────────────────────────────────────

    @QueryMapping
    public List<Note> notes() {
        return noteService.getAllNotes();
    }

    @QueryMapping
    public Note note(@Argument Long id) {
        return noteService.getNoteById(id);
    }

    // ── Mutation Resolvers ───────────────────────────────────

    /**
     * Handles: mutation { createNote(input: {...}) { ... } }
     *
     * @Argument CreateNoteInput input → Spring binds the GraphQL "input" argument
     * to the CreateNoteInput DTO automatically (matches field names by convention).
     *
     * We look up the Tag entities here (from tagIds) so the service stays
     * focused on business logic, not repository lookups.
     */
    @MutationMapping
    public Note createNote(@Argument CreateNoteInput input) {
        List<Tag> tags = (input.getTagIds() == null || input.getTagIds().isEmpty())
                ? List.of()
                : tagRepository.findAllById(input.getTagIds());
        return noteService.createNote(input, tags);
    }

    /**
     * Handles: mutation { updateNote(id: "1", input: {...}) { ... } }
     *
     * Two @Argument params: id and input — each maps to a named GraphQL argument.
     * If tagIds is null in the input, we pass null to the service (= don't change tags).
     */
    @MutationMapping
    public Note updateNote(@Argument Long id, @Argument UpdateNoteInput input) {
        List<Tag> tags = (input.getTagIds() == null)
                ? null  // null = don't change existing tags
                : tagRepository.findAllById(input.getTagIds());
        return noteService.updateNote(id, input, tags);
    }

    /**
     * Handles: mutation { deleteNote(id: "1") }
     *
     * Returns Boolean — no selection set needed in the query.
     */
    @MutationMapping
    public boolean deleteNote(@Argument Long id) {
        return noteService.deleteNote(id);
    }

    // ── Field Resolver ───────────────────────────────────────

    /**
     * Explicit field resolver for the "tags" field on the Note type.
     *
     * @SchemaMapping(typeName = "Note", field = "tags") tells Spring:
     *   "when resolving the 'tags' field on a Note, call this method"
     *
     * The method parameter Note note is the PARENT object — the Note
     * that was already resolved by notes() or note(). Spring injects
     * it automatically.
     *
     * This method is called ONCE PER NOTE in the result set, but ONLY
     * if the client's query included the tags field.
     *
     * Right now this does the same thing as the automatic convention-based
     * mapping (calling getTags()). The value of @SchemaMapping is when you
     * need custom logic: filtering, transforming, fetching from a different
     * source, etc.
     */
    @SchemaMapping(typeName = "Note", field = "tags")
    public List<Tag> tags(Note note) {
        // 'note' here is the parent — the Note whose tags we're resolving
        return note.getTags();
    }
}