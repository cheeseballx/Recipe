package de.andy.web.recipe.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

import javax.persistence.OneToMany;

import java.util.Set;

@Entity
public class Recipe{

    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = true)
    private String longname;

    @Column(nullable = true)
    private String description;

    @Column(nullable = true)
    private String imagepath;

    //mapped by others
    @OneToMany(mappedBy="recipe")
    private Set<Component> components;

    //just use for spring
    protected Recipe() {}

    //Constructor custom
    public Recipe(String name, String longname, String description) {
        this.name = name;
        this.longname = longname;
        this.description = description;
    }


    public Long getId() { return this.id;}
    public String getName() { return this.name;}
    public String getLongname() { return this.longname;}
    public String getDescription() { return this.description; }
    public String getImagepath() { return this.imagepath; }
    public Set<Component> getComponents() { return this.components; }

    public void setId(Long id) { this.id = id;}
    public void setName(String name) { this.name = name; }
    public void setLongname(String longname) { this.longname = longname; }
    public void setDescription(String description) { this.description = description;}
    public void setImagepath(String imagepath) {this.imagepath = imagepath;}
}