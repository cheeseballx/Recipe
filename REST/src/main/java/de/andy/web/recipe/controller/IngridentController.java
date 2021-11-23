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
import org.springframework.web.bind.annotation.RequestParam;

import de.andy.web.recipe.database.IngridentInterface;
import de.andy.web.recipe.model.Ingrident;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;

@RestController
@RequestMapping("/v1/Ingrident")
@Tag(name = "Ingridents", description = "Controlling the Ingridents")
public class IngridentController{

    @Autowired
    IngridentInterface IngridentDB;

    //GET ALL
    @Operation( summary = "Show all Ingridents as a list here", 
                description = "no need for params. It just returns a list")
    @GetMapping(value = "", produces = "application/json")
    @ApiResponse(responseCode = "200", description = "return Jsonlist" )
    public List<Ingrident> getAllIngridents(){
        return IngridentDB.findAll();
    }

    //GET ONE
    @Operation( summary = "Shows a Ingrident comes by ID", 
                description = "id for ")
    @GetMapping(value="/{id}", produces = "application/json")
    @ApiResponse(responseCode = "204",description = "ID is not found")
    @ApiResponse(responseCode = "200",description = "found Unit")
	public ResponseEntity<Ingrident> getIngrident(@PathVariable Long id) {
        Optional<Ingrident> opt = IngridentDB.findById(id);
        if (opt.isPresent())
            return new ResponseEntity<Ingrident>(opt.get(),HttpStatus.OK);
        else
            return new ResponseEntity<Ingrident>(HttpStatus.NO_CONTENT);
    }


    //POST ONE
    @Operation( summary = "Adds a Ingrident", 
                description = "adding a new Ingrident to db")
    @PostMapping(value = "", produces = "application/json")
    @ApiResponse(responseCode = "200",description = "newly created ID gets returned")
    @ApiResponse(responseCode = "400",description = "Some error in request")
    public ResponseEntity<String> addIngridient(@RequestParam String name,
                                                @RequestParam String unit,
                                                @RequestParam(required = false) String description) {

        Ingrident ingrident = new Ingrident(name, unit, description);
        Ingrident returnIngrident = IngridentDB.save(ingrident);

        JSONObject  obj = new JSONObject();
        obj.put("ID",returnIngrident.getId());
        obj.put("status",1);
        obj.put("msg","object created successfully");

        return new ResponseEntity<>(obj.toString(),HttpStatus.OK);
    }

    //UPDATE ONE
    @Operation (summary = "patches a Ingrident, update some values")
    @PatchMapping(value = "", consumes = "application/json", produces = "application/json")
    @ApiResponse(responseCode = "200", description = "Sucessfully changed values" )
    @ApiResponse(responseCode = "204", description = "id unknown")
    @ApiResponse(responseCode = "400", description = "missing id or sth")
    public ResponseEntity<String> updateIngrident(@RequestBody Ingrident ingrident){
        if(ingrident.getId() == null)
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Missing ID of update object (ingrident)");
        
        if(!IngridentDB.existsById(ingrident.getId())){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Ingrident with that id does not exists");
        }

        IngridentDB.save(ingrident);
        
        JSONObject ret = new JSONObject();
        ret.put("message", "successfull");

        return new ResponseEntity<String>(ret.toString(),HttpStatus.OK);
    }


    //DELETE ONE
    @DeleteMapping("/{id}")
    @ApiResponse(responseCode = "200", description = "is now deleted")
    @ApiResponse(responseCode = "204", description = "id seems not to exists")
    public ResponseEntity<String> deleteIngrident(@PathVariable Long id){
        Optional<Ingrident> opt = IngridentDB.findById(id);
        if (opt.isPresent()){
            IngridentDB.delete(opt.get());
            return new ResponseEntity<String>("Succesfull Deleted",HttpStatus.OK);
        }
        else
            return new ResponseEntity<String>("ID is not found", HttpStatus.NO_CONTENT);
    }

}