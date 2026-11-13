package com.cognitree.notes.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * JPA entity for the 'note' table.
 *
 * GraphQL counterpart: type Note { id, title, content, createdAt, tags } in schema.graphqls
 *
 * Key design decisions:
 * - tags uses LAZY fetching — they are only loaded from DB when accessed.
 *   Combined with GraphQL's field-level resolution, tags are fetched ONLY
 *   when the client explicitly asks for them in the query.
 * - createdAt is stored as LocalDateTime but exposed as String in GraphQL
 *   (the getCreatedAt() method formats it). No custom scalar needed.
 */
@Entity
@Table(name = "note")
public class Note {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    private LocalDateTime createdAt;

    // Many notes can have many tags.
    // LAZY = tags are not loaded from DB until someone calls getTags().
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "note_tags",
            joinColumns = @JoinColumn(name = "note_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private List<Tag> tags = new ArrayList<>();

    // ── Lifecycle ────────────────────────────────────────────

    /**
     * Called automatically by JPA before INSERT.
     * Sets createdAt to now — the application controls this, not the DB.
     */
    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // ── Constructors ─────────────────────────────────────────

    public Note() {}

    // ── Getters & Setters ────────────────────────────────────

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    /**
     * GraphQL schema declares createdAt as String.
     * We format LocalDateTime here so the resolver doesn't need to.
     * Spring for GraphQL calls getCreatedAt() and maps it to the 'createdAt' field.
     */
    public String getCreatedAt() {
        if (createdAt == null) return null;
        return createdAt.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<Tag> getTags() {
        return tags;
    }

    public void setTags(List<Tag> tags) {
        this.tags = tags;
    }
}

