package de.andy.web.recipe.controller;

import de.andy.web.recipe.database.RecipeInterface;
import de.andy.web.recipe.model.Recipe;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/Recipe")
@Tag(name = "Recipes", description = "Controlling the Recipes")
public class RecipeController{

    @Autowired
    RecipeInterface RecipeDB;

    //GET ALL
    @Operation( summary = "Show all Recipes as a list here", 
                description = "no need for params. It just returns a list")
    @GetMapping(value = "", produces = "application/json")
    @ApiResponse(responseCode = "200", description = "return Jsonlist" )
    public List<Recipe> getAllRecipes(){
        return RecipeDB.findAll();
    }

    //GET ONE
    @Operation( summary = "Get a specific Recipe",
                description = "give the id of the recipe and get it from database")
    @GetMapping( value="/{id}", produces = "application/json")
    @ApiResponse(responseCode = "204",description = "ID is not found")
    @ApiResponse(responseCode = "200",description = "found Recipe with that id -> return it")
    public ResponseEntity<Recipe> getRecipe(@PathVariable Long id){
        Optional<Recipe> opt = RecipeDB.findById(id);
        if (opt.isPresent())
            return new ResponseEntity<Recipe>(opt.get(),HttpStatus.OK);
        else
            return new ResponseEntity<Recipe>(HttpStatus.NO_CONTENT);
    }

    //POST ONE
    @Operation( summary = "Adds a Recipe", 
                description = "adding a new Recipe to db")
    @PostMapping(value = "", consumes = "application/json", produces = "application/json")
    @ApiResponse(responseCode = "200",description = "newly created ID gets returned")
    @ApiResponse(responseCode = "400",description = "Some error in request")
    public ResponseEntity<String> addIngridient(@RequestBody Recipe recipe) {
        if(recipe.getId() != null)
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Cannot send ID within request");

        if(recipe.getName()==null)
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Missing name. THis is needed");

        RecipeDB.save(recipe);

        return new ResponseEntity<String>(recipe.getId()+"",HttpStatus.OK);
    }
}