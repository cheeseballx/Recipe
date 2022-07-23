package de.andy.web.recipe.controller;

import de.andy.web.recipe.database.RecipeInterface;
import de.andy.web.recipe.database.TextpartInterface;
import de.andy.web.recipe.model.Recipe;
import de.andy.web.recipe.model.Textpart;

import java.util.List;
import java.util.Optional;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;


@RestController
@CrossOrigin(origins = "http://127.0.0.1:3002")
@RequestMapping("/v1/Textpart")
@Tag(name = "Textpart", description = "Controlling the Textparts")
public class TextpartController{

    @Autowired TextpartInterface TextpartDB;
    @Autowired RecipeInterface RecipeDB;

    //GET ONE
    @Operation( summary = "Get a specific Textpart",
                description = "by putting in the id youre getting a textpart")
    @GetMapping( value="/{id}", produces = "application/json")
    @ApiResponse(responseCode = "204",description = "ID is not found")
    @ApiResponse(responseCode = "200",description = "found Textpart with that id -> return it")
    public ResponseEntity<Textpart> getTedxtpart(@PathVariable Long id){
        Optional<Textpart> opt = TextpartDB.findById(id);
        if (opt.isPresent())
            return new ResponseEntity<Textpart>(opt.get(),HttpStatus.OK);
        else
            return new ResponseEntity<Textpart>(HttpStatus.NO_CONTENT);
    }

    //POST ONE
    @Operation( summary = "Adds a Textpart", 
                description = "adding a new Recipe to db")
    @PostMapping(value = "", produces = "application/json")
    @ApiResponse(responseCode = "200",description = "newly created ID gets returned")
    @ApiResponse(responseCode = "400",description = "Some error in request")
    public ResponseEntity<String> addTextpart  (@RequestParam Long recipe_id,
                                                @RequestParam Integer sort,
                                                @RequestParam String name,
                                                @RequestParam String text){
        
        Optional<Recipe> optRecipe = RecipeDB.findById(recipe_id);
        
        JSONObject  obj;

        if (!optRecipe.isPresent()){
            obj = new JSONObject();
            obj.put("status", 0);
            obj.put("msg", "recipeid is missing or wrong");
            return new ResponseEntity<>(obj.toString(), HttpStatus.BAD_REQUEST);
        }

        Textpart textpart = new Textpart(optRecipe.get(), name, sort, text);
        Textpart textpartRet = TextpartDB.save(textpart);

        obj = new JSONObject();
        obj.put("status", 1);
        obj.put("msg", "sucessfull");
        obj.put("newObj",textpartRet);
        return new ResponseEntity<>(obj.toString(), HttpStatus.OK);
    }

    //UPDATE
    //UPDATE ONE
    @Operation (summary = "change a textpart by changing some informations")
    @PatchMapping(value = "", consumes = "application/json", produces = "application/json")
    @ApiResponse(responseCode = "200", description = "Sucessfully changed textpart" )
    public ResponseEntity<String> updateTextpart(@RequestBody Textpart textpart){
        
        if(textpart.getID() == null)
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                new JSONObject().put("status", 0).put("msg", "missing id").toString());
        
        if(!TextpartDB.existsById(textpart.getID())){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                new JSONObject().put("status", 0).put("msg", "id does not exists").toString());
        }

       Textpart returnTextpart = TextpartDB.save(textpart);
        
        JSONObject ret = new JSONObject();
        ret.put("msg", "successfull changed");
        ret.put("status", 1);
        //ret.put("newRecipe", returnRecipe);

        return new ResponseEntity<String>(ret.toString(),HttpStatus.OK);
    }
}