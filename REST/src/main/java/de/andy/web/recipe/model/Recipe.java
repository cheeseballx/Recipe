package de.andy.web.recipe.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

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

    public Recipe() {}

    public Long getId() { return id;}
    public String getName() { return name;}
    public String getLongname() { return longname;}
    public String getDescription() { return description; }
    public String getImagepath() {return imagepath;}

    public void setId(Long id) { this.id = id;}
    public void setName(String name) { this.name = name; }
    public void setLongname(String longname) { this.longname = longname; }
    public void setDescription(String description) { this.description = description;}
    public void setImagepath(String imagepath) {this.imagepath = imagepath;}
}