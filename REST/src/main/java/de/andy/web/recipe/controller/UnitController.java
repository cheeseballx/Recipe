package de.andy.web.recipe.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import de.andy.web.recipe.database.UnitInterface;
import de.andy.web.recipe.model.Unit;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.parameters.RequestBody;

@RestController
@RequestMapping("/v1/units")
@Tag(name = "Units", description = "Controlling the Units for all our recipes")
public class UnitController{

    @Autowired
    UnitInterface UnitDB;
    
    @Operation( summary = "Show all Units as a list", 
                description = "no need for params. It just returns a list, but if you want to give optionals")
    @GetMapping("")
    public List<Unit> getAllUnits(){
        return UnitDB.findAll();
    }

    @Operation( summary = "Shows a Unit", 
                description = "id for ")
    @GetMapping("/{id}")
	public String getUnit(Long id) {
		return "refill quark new id  " + id;
    }
    
    @Operation( summary = "Adds a Unit", 
                description = "we need the following data")
    @PostMapping(value="/test",consumes = "application/json")
    public ResponseEntity<Long> createUser(@RequestBody String unit) {
        
        System.out.println(unit == null);
        System.out.println(unit);
        //System.out.println(unit.getBase_unit());
        //System.out.println(unit.getName());
        System.out.println(unit.getClass());

        //UnitDB.save(newUnit);
        return new ResponseEntity<>(1L,HttpStatus.OK);
    }

}