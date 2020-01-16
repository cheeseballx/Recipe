package de.andy.web.recipe.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/recipe")
public class MainRecipeController{

    @
    @GetMapping("")
    public String mainget(){
        return "hello World";
    }

    @GetMapping("/{id}")
	public String index(Long id) {
		return "rerere " + id;
	}

}