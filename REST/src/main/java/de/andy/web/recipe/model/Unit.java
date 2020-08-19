package de.andy.web.recipe.model;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Column;
import javax.persistence.Id;

@Entity
public class Unit { 

    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String base_unit;

    @Column(nullable = true) //10,-10 for mult or div by
    private Integer bigger_id;

    @Column(nullable = true)
    private Integer bigger_factor;

    @Column(nullable = true)
    private Integer smaller_id;

    @Column(nullable = true)
    private Integer smaller_factor;

    public Unit() {}
    
    public Long getId(){ return this.id;}
    public String getName(){ return this.name;}
    public String getBase_unit() { return this.base_unit; }
    public Integer getBigger_id(){ return this.bigger_id; }
    public Integer getSmaller_id(){ return this.smaller_id; }
    public Integer getBigger_factor(){ return this.bigger_factor; }
    public Integer getSmaller_factor() { return this.bigger_factor; }

    public void setId(Long id){ this.id = id;}
    public void setName(String name){ this.name = name;}
    public void setBase_unit(String base_unit){ this.base_unit = base_unit; }
    public void setBigger_id(Integer bigger_id){ this.bigger_id = bigger_id; }
    public void setSmaller_id(Integer smaller_id) {this.smaller_id = smaller_id; }
    public void setSmaller_factor(Integer smaller_factor){this.smaller_factor = smaller_factor;}
    public void setBigger_factor(Integer bigger_factor){this.bigger_factor = bigger_factor;}
}
