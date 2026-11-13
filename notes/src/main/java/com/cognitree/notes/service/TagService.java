package com.cognitree.notes.service;

import com.cognitree.notes.entity.Tag;
import com.cognitree.notes.repository.TagRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class TagService {

    private final TagRepository tagRepository;

    public TagService(TagRepository tagRepository) {
        this.tagRepository = tagRepository;
    }

    public List<Tag> getAllTags() {
        return tagRepository.findAll();
    }

    /**
     * Creates a new tag with the given name.
     * Maps to: mutation { createTag(name: "...") }
     */
    public Tag createTag(String name) {
        Tag tag = new Tag(name);
        return tagRepository.save(tag);
    }
}