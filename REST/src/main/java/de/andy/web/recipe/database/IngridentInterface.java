package de.andy.web.recipe.database;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import de.andy.web.recipe.model.Ingrident;

@Repository
public interface IngridentInterface extends JpaRepository<Ingrident, Long> {
}