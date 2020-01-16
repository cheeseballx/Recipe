package de.andy.web.recipe.model;

import java.util.ArrayList;

import de.andy.web.recipe.model.Ingrident;

public class Recipe{


    private Long id;
    private ArrayList<Ingrident> ingridents;
    private ArrayList<TextPart> textParts;
    private ArrayList<Tag> tags;


    public Long getId(){ return id;}
    public ArrayList<Ingrident> getIngridents(){ return ingridents; }
    public ArrayList<TextPart> getTextParts(){ return textParts; }
    public ArrayList<Tag> getTags() { return tags;}

    public void setId( Long id){ this.id = id; }
    public void setIngridents( ArrayList<Ingrident> ingridents) { this.ingridents = ingridents; }
    public void setTextParts( ArrayList<TextPart> textParts) { this.textParts = textParts; }
    public void setTags(ArrayList<Tag> tags) { this.tags = tags; }

    
}