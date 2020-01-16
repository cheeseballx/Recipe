package de.andy.web.recipe.model;

public class Tag{
    Long id;
    String name;

    public Tag(String name){
        this.name = name;
        this.id = -1L;
    }

    public void setName(String name){ this.name = name; }
    public void setId(Long id){ this.id = id; }

    public Long getId(){ return this.id; }
    public String getName() { return this.name; }

}