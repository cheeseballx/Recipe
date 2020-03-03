package de.andy.web.recipe.controller;

import de.andy.web.recipe.model.Recipe;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/recipe")
public class RecipeController{

    @GetMapping("")
    public String getallreciepes(){
        return "query sds";
    }

    @PostMapping("")
    public String addarecipe(Recipe recipe){
        return "done";
    }

    @GetMapping("/{id}")
	public String index(Long id) {
		return "refill quark new id  " + id;
	}

}