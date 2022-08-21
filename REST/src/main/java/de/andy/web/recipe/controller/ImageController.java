package de.andy.web.recipe.controller;

import de.andy.web.recipe.database.RecipeInterface;
import de.andy.web.recipe.database.ImageInterface;
import de.andy.web.recipe.model.Image;
import de.andy.web.recipe.model.Recipe;

import java.util.Optional;
import java.io.File;

import javax.servlet.http.HttpServletRequest;
import org.json.JSONObject;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;



@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/v1/Image")
@Tag(name = "Image", description = "Controlling the Images")
public class ImageController{

    @Value("${custom.dir.img}")
    private String imageDir;


    
    @Autowired ImageInterface imageDB;
    @Autowired RecipeInterface recipeDB;

    @Autowired
    private HttpServletRequest request;


    //GET ONE
    @Operation( summary = "Get a specific Image",
                description = "by putting in the id youre getting an image")
    @GetMapping( value="/{id}", produces = "application/json")
    @ApiResponse(responseCode = "204",description = "ID is not found")
    @ApiResponse(responseCode = "200",description = "found Image with that id -> return it")
    public ResponseEntity<Image> getImage(@PathVariable Long id){
        Optional<Image> opt = imageDB.findById(id);
        if (opt.isPresent())
            return new ResponseEntity<Image>(opt.get(),HttpStatus.OK);
        else
            return new ResponseEntity<Image>(HttpStatus.NO_CONTENT);
    }

    //Post Image
    @Operation( summary = "post a new image",
                description = "by uploading an image with name, url and so on")
    @PostMapping(value = "", produces = "application/json", consumes="multipart/form-data")
    @ApiResponse(responseCode = "200",description = "newly created ID gets returned")
    @ApiResponse(responseCode = "400",description = "Some error in request")
    public ResponseEntity<String> addImage  (   @RequestParam Long recipe_id, 
                                                @RequestParam String name,
                                                @RequestParam String replace,
                                                @RequestPart(value="file", required = false) MultipartFile file){
        
        Optional<Recipe> optRecipe = recipeDB.findById(recipe_id);
        
        JSONObject  obj;

        if (!optRecipe.isPresent()){
            obj = new JSONObject();
            obj.put("status", 0);
            obj.put("msg", "recipeid is missing or wrong");
            return new ResponseEntity<>(obj.toString(), HttpStatus.BAD_REQUEST);
        }

        String path = null;
        
        String ending = file.getOriginalFilename().split("\\.")[1];
        String fullName = name + "_" + System.currentTimeMillis() + "." + ending;
        
        //^ TODO check if there is an ending and give back serious error

        try{
            path = imageDir + fullName;
            File dest = new File(path);
            file.transferTo(dest);
        }
        catch(Exception e){
            System.out.print("error");
            System.out.println(e.toString());
        }

        Image image = new Image(optRecipe.get(), "/" + fullName, replace);
        Image imageReturn = imageDB.save(image);

        obj = new JSONObject();
        obj.put("status", 1);
        obj.put("msg", "sucessfull");
        obj.put("newObj",imageReturn);
        return new ResponseEntity<>(obj.toString(), HttpStatus.OK);
    }

    
}



