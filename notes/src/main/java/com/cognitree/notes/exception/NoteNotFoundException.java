package com.cognitree.notes.exception;

/**
 * Thrown when a Note is requested by ID but doesn't exist.
 *
 * This is a plain Java exception — it knows nothing about GraphQL.
 * The GraphQLExceptionHandler translates it into a proper GraphQL error.
 *
 * Keeping exceptions GraphQL-unaware means they're reusable across
 * REST, GraphQL, CLI, or any other interface layered on top.
 */
public class NoteNotFoundException extends RuntimeException {

    private final Long noteId;

    public NoteNotFoundException(Long noteId) {
        super("Note not found: " + noteId);
        this.noteId = noteId;
    }

    public Long getNoteId() {
        return noteId;
    }
}

