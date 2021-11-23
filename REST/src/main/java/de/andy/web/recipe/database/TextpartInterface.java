package de.andy.web.recipe.database;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import de.andy.web.recipe.model.Textpart;

@Repository
public interface TextpartInterface extends JpaRepository<Textpart, Long> {
}
