package de.andy.web.recipe.controller;

import java.util.List;
import java.util.Optional;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;

import de.andy.web.recipe.database.ComponentInterface;
import de.andy.web.recipe.model.Component;

import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;

@RestController
@RequestMapping("/v1/Components")
@Tag(name = "Components", description = "Controlling the Components for specific Recipe")
public class ComponentController{

    @Autowired
    ComponentInterface ComponentDB;

    //GET ALL
    @Operation( summary = "Show all Components as a list here", 
                description = "no need for params. It just returns a list")
    @GetMapping(value = "", produces = "application/json")
    @ApiResponse(responseCode = "200", description = "return Jsonlist" )
    public List<Component> getAllComponents(){
        return ComponentDB.findAll();
    }

    //GET ONE
    @Operation( summary = "Shows a Component comes by ID", 
                description = "id for ")
    @GetMapping(value="/{id}", produces = "application/json")
    @ApiResponse(responseCode = "204",description = "ID is not found")
    @ApiResponse(responseCode = "200",description = "found Component")
	public ResponseEntity<Component> getComponent(@PathVariable Long id) {
        Optional<Component> opt = ComponentDB.findById(id);
        if (opt.isPresent())
            return new ResponseEntity<Component>(opt.get(),HttpStatus.OK);
        else
            return new ResponseEntity<Component>(HttpStatus.NO_CONTENT);
    }


}