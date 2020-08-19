package de.andy.web.recipe.model;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Column;
import javax.persistence.Id;

@Entity
public class Component { 

    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    private Long id;

    @Column(nullable = false)
    private Long recipe_id;

    @Column(nullable = false)
    private Long ingrident_id;

    @Column(nullable = true)
    private Float amount;

    public Component(){}

    public Long getId(){ return this.id; }
    public Long getRecipe_id(){return this.recipe_id; }
    public Long getIngrident_id(){return this.ingrident_id; }
    public Float getAmount() {return this.amount; }

    public void setId(Long id){ this.id = id; }    
    public void setRecipe_id(Long recipe_id){ this.recipe_id = recipe_id; }
    public void setIngrident_id(Long ingrident_id){ this.ingrident_id = ingrident_id; }
    public void setAmount(Float amount){ this.amount = amount; }
}