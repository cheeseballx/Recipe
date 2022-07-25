package de.andy.web.recipe.model;

import javax.persistence.Entity;
import javax.persistence.Column;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToOne;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
public class Image {

    //Primary Key ID
    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    private Long id;
    public Long getId() { return this.id;}

    // URL
    @Column(nullable = false)
    private String url;
    public String getUrl() { return this.url;}

    // Replacement text of image
    @Column(nullable = true)
    private String replacement;
    public String getReplacement() { return this.replacement;}

    // Position in recipe
    @Column(nullable = true)
    private String pos;
    public String getPos() { return this.pos;}
    

    // ===========================
    //  MAPPINGS For Image Class
    // ===========================

    @ManyToOne
    @JoinColumn(name = "recipe_id", nullable=false)
    @JsonIgnore
    private Recipe recipe;

    // ============================
    //  Functions / Constructions
    // ============================

    protected Image() {};

    public Image(Recipe recipe, String url, String replacement){
        this.recipe = recipe;
        this.url = url;
        this.replacement = replacement;
    }
}