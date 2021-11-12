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

    //We need to set a language to use correct units
    @Column(nullable = false)
    private String language;

    //Gewicht
    @Column(nullable = false)
    private String baseName;

    //Es braucht keine Beschreibung für Gewicht in unserem Fall
    @Column(nullable = true)
    private String description;

    //0 means the base and is unit in the middle
    //1 and 2 and so on will define the bigger units like t in this case 
    //02 and 01 are for the smaller ones loike g in this case

    //kg
    @Column(nullable = false)
    private String unit0;

    //kilogram
    @Column(nullable = false)
    private String unit0Name;

    //g
    @Column(nullable = true)
    private String unit01;

    //Gramm
    @Column(nullable = true)
    private String unit01Name;

    // 1000 kg*1000
    @Column(nullable = true)
    private int unit01Fak;

    //mg
    @Column(nullable = true)
    private String unit02;

    //Milligram
    @Column(nullable = true)
    private String unit02Name;

    // 1000000 kg*1000000
    @Column(nullable = true)
    private int unit02Fak;

    @Column(nullable = true)
    private String unit03;

    @Column(nullable = true)
    private String unit03Name;

    @Column(nullable = true)
    private int unit03Fak;

    //t
    @Column(nullable = true)
    private String unit1;

    //tonns
    @Column(nullable = true)
    private String unit1Name;

    // 1000 kg / 1000 = t
    @Column(nullable = true)
    private int unit1Fak;

    @Column(nullable = true)
    private String unit2;

    @Column(nullable = true)
    private String unit2Name;

    @Column(nullable = true)
    private int unit2Fak;

    @Column(nullable = true)
    private String unit3;

    @Column(nullable = true)
    private String unit3Name;

    @Column(nullable = true)
    private int unit3Fak;

    public Unit() {}


    public Long getId() {return this.id; }
    public String getLanguage() { return this.language; }
    public String getBaseName() { return this.baseName; }
    public String getDescription() { return this.description; }
    public String getUnit0() { return this.unit0; }
    public String getUnit0Name() { return this.unit0Name; }
    public String getUnit01() { return this.unit01;}
    public String getUnit01Name() { return this.unit01Name; }
    public int getUnit01Fak() { return this.unit01Fak; }
    public String getUnit02() { return this.unit02; }
    public String getUnit02Name() { return this.unit02Name; }
    public int getUnit02Fak() { return this.unit02Fak; }
    public String getUnit03() { return this.unit03; }
    public String getUnit03Name() { return this.unit03Name; }
    public int getUnit03Fak() { return this.unit03Fak; }
    public String getUnit1() { return this.unit1; }
    public String getUnit1Name() { return this.unit1Name; }
    public int getUnit1Fak() { return this.unit1Fak; }
    public String getUnit2() { return this.unit2; }
    public String getUnit2Name() { return this.unit2Name; }
    public int getUnit2Fak() { return this.unit2Fak; }
    public String getUnit3() { return this.unit3; }
    public String getUnit3Name() { return this.unit3Name; }
    public int getUnit3Fak() { return this.unit3Fak; }
    
}
