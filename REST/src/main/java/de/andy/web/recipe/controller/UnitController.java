package de.andy.web.recipe.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;

@RestController
@RequestMapping("/v1/units")
@Tag(name = "Units", description = "Controlling the Units for all our recipes")
public class UnitController{

    @Operation( summary = "Show all Units as a list", 
                description = "no need for params. It just returns a list, but if you want to give optionals")
    @GetMapping("")
    public String getAllUnits(){
        return "";
    }

    @Operation( summary = "Shows a Unit", 
                description = "id for ")
    @GetMapping("/{id}")
	public String getUnit(Long id) {
		return "refill quark new id  " + id;
    }
    
    @Operation( summary = "Adds a Unit", 
                description = "we need the following data")
    @PostMapping("")
    public String addUnit(Long id) {
    return "refill quark new id  " + id;
}

}