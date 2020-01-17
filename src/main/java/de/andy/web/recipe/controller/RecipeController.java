package de.andy.web.recipe.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/recipe")
public class RecipeController{

    @GetMapping("")
    public String getallreciepes(){
        return "query database";
    }

    @PostMapping
    public void addarecipe(@B)

    @GetMapping("/{id}")
	public String index(Long id) {
		return "rerere " + id;
	}

}