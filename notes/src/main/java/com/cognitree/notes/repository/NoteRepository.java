package com.cognitree.notes.repository;

import com.cognitree.notes.entity.Note;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data JPA repository for Note.
 *
 * JpaRepository<Note, Long> gives us for free:
 *   findAll(), findById(id), save(note), deleteById(id), existsById(id), ...
 *
 * No implementation needed — Spring generates it at runtime.
 */
public interface NoteRepository extends JpaRepository<Note, Long> {
}

