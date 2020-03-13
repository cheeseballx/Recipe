package de.andy.web.recipe.database;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import de.andy.web.recipe.model.Unit;

@Repository
public interface UnitInterface extends JpaRepository<Unit, Long> {

    //List<Plate> findByTitleContainingOrContentContaining(String text, String textAgain);
}