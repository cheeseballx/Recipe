package de.andy.web.recipe.controller;

import java.util.List;
import java.util.Optional;

import org.json.JSONObject;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.CrossOrigin;

import de.andy.web.recipe.database.ComponentInterface;
import de.andy.web.recipe.database.IngridentInterface;
import de.andy.web.recipe.database.RecipeInterface;
import de.andy.web.recipe.model.Component;
import de.andy.web.recipe.model.Recipe;
import de.andy.web.recipe.model.Ingrident;

import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/v1/Components")
@Tag(name = "Components", description = "Controlling the Components for specific Recipe")
public class ComponentController {

    @Autowired
    ComponentInterface ComponentDB;
    @Autowired
    RecipeInterface RecipeDB;
    @Autowired
    IngridentInterface IngridentDB;

    // GET ALL
    @Operation(summary = "Show all Components as a list here", description = "no need for params. It just returns a list")
    @GetMapping(value = "", produces = "application/json")
    @ApiResponse(responseCode = "200", description = "return Jsonlist")
    public List<Component> getAllComponents() {
        return ComponentDB.findAll();
    }

    // GET ONE
    @Operation(summary = "Shows a Component comes by ID", description = "id for ")
    @GetMapping(value = "/{id}", produces = "application/json")
    @ApiResponse(responseCode = "204", description = "ID is not found")
    @ApiResponse(responseCode = "200", description = "found Component")
    public ResponseEntity<Component> getComponent(@PathVariable Long id) {
        Optional<Component> opt = ComponentDB.findById(id);
        if (opt.isPresent())
            return new ResponseEntity<Component>(opt.get(), HttpStatus.OK);
        else
            return new ResponseEntity<Component>(HttpStatus.NO_CONTENT);
    }

    // POST ONE
    @Operation(summary = "Adds a Component", description = "adding a Compinent to db")
    @PostMapping(value = "", produces = "application/json")
    @ApiResponse(responseCode = "200", description = "newly created ID gets returned")
    @ApiResponse(responseCode = "400", description = "Some error in request")
    public ResponseEntity<String> addComponent(@RequestParam Long recipe_id, @RequestParam Long ingrident_id,
            @RequestParam(required = false) Float amount) {

        Optional<Recipe> recipeOpt = RecipeDB.findById(recipe_id);
        Optional<Ingrident> ingridentOpt = IngridentDB.findById(ingrident_id);

        JSONObject obj = new JSONObject();

        if (recipeOpt.isPresent() && ingridentOpt.isPresent()) {

            Component component = new Component(recipeOpt.get(), ingridentOpt.get(), amount);
            Component returnComponent = ComponentDB.save(component);

            obj.put("ID", returnComponent.getId());
            obj.put("status", 1);
            obj.put("msg", "object created successfully");

            return new ResponseEntity<>(obj.toString(), HttpStatus.OK);
        } else {
            obj.put("status", 0);
            obj.put("msg", "recipeid or ingrident id is missing or wrong or both");
            return new ResponseEntity<>(obj.toString(), HttpStatus.BAD_REQUEST);
        }

    }

}