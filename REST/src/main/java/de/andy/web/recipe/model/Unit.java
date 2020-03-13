package de.andy.web.recipe.model;

import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;

import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;


@Entity
public class Unit implements Serializable { 

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String baseUnit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable= true, name = "unit_id")
    private Unit bigger;

    @Column(columnDefinition = "int default 10")
    private int bigger_factor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable= true, name = "unit_id")
    private Unit smaller;

    @Column(columnDefinition = "int default -10")
    private int smaller_factor;


    protected Unit(){}

    public Unit(String name, String baseUnit){
        this.name = name;
        this.baseUnit = baseUnit;
    }

    public String getName(){ return this.name;}
    public String getBaseUnit() { return this.baseUnit; }
    public Unit getBigger(){ return this.bigger; }
    public Unit getSmaller(){ return this.smaller; }
    public int getBigger_factor(){ return this.bigger_factor; }
    public int getSmaller_factor() { return this.bigger_factor; }

    public void setName(String name){ this.name = name;}
    public void setBaseUnit(String baseUnit){ this.baseUnit = baseUnit; }
    public void setBigger(Unit bigger){ this.bigger = bigger; }
    public void setSmaller(Unit smaller) {this.smaller = smaller; }
    public void setSmaller_factor(int smaller_factor){this.smaller_factor = smaller_factor;}
    public void setBigger_factor(int bigger_factor){this.bigger_factor = bigger_factor;}
}
