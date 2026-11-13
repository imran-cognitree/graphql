package com.cognitree.notes.dto;

import java.util.List;

/**
 * Maps to the GraphQL input type: UpdateNoteInput
 *
 * All fields are nullable — the client sends only what it wants to change.
 * null means "don't change this field" (partial update / PATCH semantics).
 *
 * Schema:
 *   input UpdateNoteInput {
 *     title: String
 *     content: String
 *     tagIds: [ID!]
 *   }
 */
public class UpdateNoteInput {

    private String title;
    private String content;
    private List<Long> tagIds;

    public UpdateNoteInput() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public List<Long> getTagIds() { return tagIds; }
    public void setTagIds(List<Long> tagIds) { this.tagIds = tagIds; }
}

