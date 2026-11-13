package com.cognitree.notes.controller;

import com.cognitree.notes.entity.Tag;
import com.cognitree.notes.service.TagService;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
public class TagController {

    private final TagService tagService;

    public TagController(TagService tagService) {
        this.tagService = tagService;
    }

    @QueryMapping
    public List<Tag> tags() {
        return tagService.getAllTags();
    }

    /**
     * Handles: mutation { createTag(name: "java") { id name } }
     *
     * Note: @Argument here binds a simple scalar (String), not an input type.
     * For simple args you don't need a DTO — just use the type directly.
     */
    @MutationMapping
    public Tag createTag(@Argument String name) {
        return tagService.createTag(name);
    }
}