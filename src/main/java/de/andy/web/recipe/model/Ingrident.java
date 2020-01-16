package de.andy.web.recipe.model;

import de.andy.web.recipe.model.Unit;

public class Ingrident{

    private String name;
    private Unit unit;

    public Ingrident( String name, Unit unit){
        this.name = name;
        this.unit = unit;
    }

    public String getName(){ return this.name; }
    public Unit getUnit() { return this.unit; }

    public void setName(String name){ this.name = name; }
    public void setUnit(Unit unit) { this.unit = unit; }

    @Override
    public String toString(){
        return String.format("%s [%s]", this.name,this.unit);
    }

}