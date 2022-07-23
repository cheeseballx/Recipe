package de.andy.web.recipe.model;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonProperty.Access;

import java.util.Set;

@Entity
public class Recipe{

    //======================================//
    //=========== MAIN Columns =============// 
    //======================================//

    // Primary KEY ID
    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    private Long id; 
    public Long getId() { return this.id;}

    // Name
    @Column(nullable = false)
    private String name;
    public String getName() { return this.name;}

    // Longname
    @Column(nullable = true)
    private String longname;
    public String getLongname() { return this.longname;}

    // Short description
    @Column(nullable = true)
    private String description;
    public String getDescription() { return this.description; }

    // Fast recipe
    @Column(nullable = true)
    private String fastrecipe;
    public String getFastrecipe() { return this.fastrecipe; }

    // Time doing
    @Column(nullable = true)
    private Integer doingtime;
    public Integer getDoingtime() { return this.doingtime; }

    // Time wait
    @Column(nullable = true)
    private Integer waitingtime;
    public Integer getWaitingtime() { return this.waitingtime; }

    // Main Image
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "mainimage_id", referencedColumnName = "id")
    private Image mainimage;
    public Image getMainimage() { return this.mainimage; }

    //======================================//
    //======= mapped by other classes ======// 
    //======================================//

    //components for recipe
    @JsonProperty(access = Access.READ_ONLY)
    @OneToMany(mappedBy="recipe")
    private Set<Component> components;
    public Set<Component> getComponents() { return this.components; }

    //images for recipe
    @OneToMany(mappedBy="recipe")
    @JsonProperty(access = Access.READ_ONLY)
    private Set<Image> images;
    public Set<Image> getImages() {return this.images; }

    //textParts for recipe
    @OneToMany(mappedBy="recipe")
    @JsonProperty(access = Access.READ_ONLY)
    private Set<Textpart> textparts;
    public Set<Textpart> getTextparts() {return this.textparts; }

    //======================================//
    //========== Functions =================// 
    //======================================//

    //just use for spring
    protected Recipe() {}

    //Constructor custom
    public Recipe(String name, String longname, String description) {
        this.name = name;
        this.longname = longname;
        this.description = description;
    }

    //set main image
    public 

}