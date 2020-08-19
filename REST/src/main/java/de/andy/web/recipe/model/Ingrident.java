package de.andy.web.recipe.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Entity
public class Ingrident{

    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    private Long id;

    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private Long unit_id;

    @Column(nullable = true)
    private String description;

    public Ingrident(){};
    
    public Long getId() { return id; }
    public String getName(){ return this.name; }
    public Long getUnit_id() { return this.unit_id; }
    public String getDescription() {return this.description; }

    public void setId(Long id) { this.id = id; }
    public void setName(String name){ this.name = name; }
    public void setUnit_id(Long unit_id) { this.unit_id = unit_id; }
    public void setDescription(String description) {this.description = description; }
}