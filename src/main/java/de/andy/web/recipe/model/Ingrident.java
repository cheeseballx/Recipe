package de.andy.web.recipe.model;

import de.andy.web.recipe.model.Unit;

public class Ingrident{

    private float value;
    private Unit unit;

    public Ingrident( float value, Unit unit){
        this.value = value;
        this.unit = unit;
    }
    
    
    public float getValue(){ return this.value; }
    public Unit getUnit() { return this.unit; }

    public void setValue(float value){ this.value = value; }
    public void setUnit(Unit unit) { this.unit = unit; }

    @Override
    public String toString(){
        return String.format("%s [%s]", this.value,this.unit);
    }

}