package de.andy.web.recipe.model;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Column;
import javax.persistence.Id;

import com.fasterxml.jackson.annotation.JsonIgnore;


import javax.persistence.ManyToOne;
import javax.persistence.JoinColumn;

@Entity
public class Component { 

    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "recipe_id", nullable=false)
    @JsonIgnore
    private Recipe recipe;

    @ManyToOne
    @JoinColumn(name = "ingrident_id", nullable=false)
    private Ingrident ingrident;

    @Column(nullable = true)
    private Float amount;

    //Spring one
    protected Component(){}

    //our
    public Component(Recipe recipe, Ingrident ingrident, Float amount){
        this.recipe = recipe;
        this.ingrident = ingrident;
        this.amount = amount;
    }


    public Long getId(){ return this.id; }
    public Recipe getRecipe(){return this.recipe; }
    public Ingrident getIngrident(){return this.ingrident; }
    public Float getAmount() {return this.amount; }

}