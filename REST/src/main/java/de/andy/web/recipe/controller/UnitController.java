package de.andy.web.recipe.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;

import de.andy.web.recipe.database.UnitInterface;
import de.andy.web.recipe.model.Unit;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;

@RestController
@RequestMapping("/v1/units")
@Tag(name = "Units", description = "Controlling the Units for all our recipes")
public class UnitController{

    @Autowired
    UnitInterface UnitDB;

    //GET ALL
    @Operation( summary = "Show all Units as a list here", 
                description = "no need for params. It just returns a list, but if you want to give optionals")
    @GetMapping(value = "", produces = "application/json")
    public List<Unit> getAllUnits(){
        return UnitDB.findAll();
    }

    //GET ONE
    @Operation( summary = "Shows a Unit selection comes by ID", 
                description = "id for ")
    @GetMapping(value="/{id}", produces = "application/json")
    @ApiResponse(responseCode = "204",description = "ID is not found")
    @ApiResponse(responseCode = "200",description = "found Unit")
	public ResponseEntity<Unit> getUnit(@PathVariable Long id) {
        Optional<Unit> opt = UnitDB.findById(id);
        if (opt.isPresent())
            return new ResponseEntity<Unit>(opt.get(),HttpStatus.OK);
        else
            return new ResponseEntity<Unit>(HttpStatus.NO_CONTENT);
    }
    @Operation( summary = "Adds a Unit or Overwirtes given Unit", 
                description = "adding a new unit to db or in case of id is given overwrite an existing one")
    
    //POST ONE
    @PostMapping("")
    @ApiResponse(responseCode = "200",description = "newly created ID gets returned")
    @ApiResponse(responseCode = "400",description = "Some error in request")
    public ResponseEntity<String> addUnit(@RequestBody Unit unit) {
        if(unit.getId() != null)
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Cannot send ID within request");

        if(unit.getName()==null || unit.getBase_unit()==null)
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Missing name or base_unit");

        UnitDB.save(unit);

        return new ResponseEntity<String>(unit.getId()+"",HttpStatus.OK);
    }

    //DELETE ONE
    @DeleteMapping("/{id}")
    @ApiResponse(responseCode = "200", description = "is now deleted")
    @ApiResponse(responseCode = "204", description = "id seems not to exists")
    public ResponseEntity<String> deleteUnit(@PathVariable Long id){
        Optional<Unit> opt = UnitDB.findById(id);
        if (opt.isPresent()){
            UnitDB.delete(opt.get());
            return new ResponseEntity<String>(HttpStatus.OK);
        }
        else
            return new ResponseEntity<String>("ID is not found", HttpStatus.NO_CONTENT);

    }

}