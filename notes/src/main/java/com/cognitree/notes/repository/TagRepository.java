package com.cognitree.notes.repository;

import com.cognitree.notes.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data JPA repository for Tag.
 *
 * JpaRepository<Tag, Long> gives us for free:
 *   findAll(), findById(id), findAllById(ids), save(tag), ...
 */
public interface TagRepository extends JpaRepository<Tag, Long> {
}

