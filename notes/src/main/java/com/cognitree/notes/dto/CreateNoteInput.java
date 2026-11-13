package com.cognitree.notes.dto;

import java.util.List;

/**
 * Maps to the GraphQL input type: CreateNoteInput
 *
 * Spring for GraphQL automatically binds the incoming GraphQL argument
 * to this class by matching field names.
 *
 * Schema:
 *   input CreateNoteInput {
 *     title: String!
 *     content: String
 *     tagIds: [ID!]
 *   }
 */
public class CreateNoteInput {

    private String title;
    private String content;
    private List<Long> tagIds;  // IDs of existing tags to attach

    public CreateNoteInput() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public List<Long> getTagIds() { return tagIds; }
    public void setTagIds(List<Long> tagIds) { this.tagIds = tagIds; }
}

