package de.andy.web.recipe.model;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;

import java.io.Serializable;

import javax.annotation.Resource;
import javax.persistence.Column;
import javax.persistence.Id;

@Entity
public class Unit implements Serializable { 

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String base_unit;

    @Column(nullable = true) //10,-10 for mult or div by
    private int bigger_id;

    @Column(nullable = true)
    private int bigger_factor;

    @Column(nullable = true)
    private int smaller_id;

    @Column(nullable = true)
    private int smaller_factor;


    public Unit() {}
    
    
    public Long getID(){ return this.id;}
    public String getName(){ return this.name;}
    public String getBase_unit() { return this.base_unit; }
    public int getBigger_id(){ return this.bigger_id; }
    public int getSmaller_id(){ return this.smaller_id; }
    public int getBigger_factor(){ return this.bigger_factor; }
    public int getSmaller_factor() { return this.bigger_factor; }

    public void setId(Long id){ this.id = id;}
    public void setName(String name){ this.name = name; System.out.println("Test2");}
    public void setBase_unit(String base_unit){ this.base_unit = base_unit; }
    public void setBigger_id(int bigger_id){ this.bigger_id = bigger_id; }
    public void setSmaller_id(int smaller_id) {this.smaller_id = smaller_id; }
    public void setSmaller_factor(int smaller_factor){this.smaller_factor = smaller_factor;}
    public void setBigger_factor(int bigger_factor){this.bigger_factor = bigger_factor;}
}
