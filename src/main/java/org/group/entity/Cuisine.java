package org.group.entity;

import java.io.Serializable;

/**
 * Created by lincolnz9511 on 16-11-26.
 */
public class Cuisine implements Serializable {
    private static final long serialVersionUID = 1L;
    private String cuisine_name,description, city;
    private double price;
    public Cuisine() {
        this.cuisine_name = "default_cuisine";
        this.description = "default_description";
        this.price = 100.00;
    }
    public Cuisine(String cuisine_name,String description,double price,String city) {
        this.cuisine_name = cuisine_name;
        this.description = description;
        this.price = price;
        this.city = city;
    }
    public void setCuisine_name(String cuisine_name) {
        this.cuisine_name = cuisine_name;
    }
    public String getCuisine_name() {
        return this.cuisine_name;
    }
    public void setDescription(String description) {
        this.description = description;
    }
    public String getDescription() {
        return this.description;
    }
    public void setPrice(double price) {
        this.price = price;
    }
    public double getPrice() {
        return this.price;
    }
    public void setCity(String city) {
    	this.city = city;
    }
    public String getCity() {
    	return this.city;
    }
}
