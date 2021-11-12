package de.andy.web.recipe.model;

import java.util.Set;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

import javax.persistence.OneToMany;


@Entity
public class Ingrident{

    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;
    
    @Column(nullable = false)
    private String unit;

    @Column(nullable = true)
    private String description;

    //Not own property
    @OneToMany(mappedBy="ingrident")
    private Set<Component> components;

    //empty for spring
    protected Ingrident(){};

    //normal for creating Instance
    public Ingrident(String name, String unit, String description){
        this.name = name;
        this.unit = unit;
        this.description = description;
    }
    
    public Long getId() { return id; }
    public String getName(){ return this.name; }
    public String getUnit() { return this.unit; }
    public String getDescription() {return this.description; }
}