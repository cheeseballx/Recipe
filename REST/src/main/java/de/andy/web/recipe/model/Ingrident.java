package de.andy.web.recipe.model;

public class Ingrident{

    private long id;
    private float value;
    private Unit unit;

    public Ingrident( float value, Unit unit){
        this.id = -1L;
        this.value = value;
        this.unit = unit;
    }
    
    public long getId() { return id; }
    public float getValue(){ return this.value; }
    public Unit getUnit() { return this.unit; }

    public void setId(long id) { this.id = id; }
    public void setValue(float value){ this.value = value; }
    public void setUnit(Unit unit) { this.unit = unit; }

    @Override
    public String toString(){
        return String.format("%s [%s]", this.value,this.unit);
    }

}