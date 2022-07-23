package de.andy.web.recipe.database;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import de.andy.web.recipe.model.Image;

@Repository
public interface ImageInterface extends JpaRepository<Image, Long> {
}