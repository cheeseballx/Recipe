package de.andy.web.recipe.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
public class Textpart {

    // Primary key
    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    private Long id;
    public Long getID() { return this.id; }

    // Text 
    @Column(nullable = false)
    private String text;
    public String getText() { return this.text; }

    //sort it in
    @Column(nullable = false, unique=true)
    private Integer sort;
    public Integer getSort() { return this.sort; }

    // Text like 1. Schritt or sth like that
    @Column(nullable = true)
    private String name;
    public String getName() { return this.name; }

    // Description
    @Column(nullable = true)
    private String description;
    public String getDescription() { return this.description; }

    @ManyToOne
    @JoinColumn(name = "recipe_id", nullable=false)
    @JsonIgnore
    private Recipe recipe;

    protected Textpart(){};

    //Constructor custom
    public Textpart(Recipe recipe, String name, Integer sort, String text) {
        this.recipe = recipe;
        this.name = name;
        this.sort = sort;
        this.text = text;
    }
}
