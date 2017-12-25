package org.group.entity;

import java.io.Serializable;

/**
 * Created by lincolnz9511 on 16-11-26.
 */
public class Order implements Serializable {
    private static final long serialVersionUID = 1L;
    private String username,cuisine_name;
    private int number;

    public Order() {
        this.username = "default";
        this.cuisine_name = "default_cuisine";
        this.number = 1;
    }
    public Order(String username,String cuisine_name,int number){
        this.username = username;
        this.cuisine_name = cuisine_name;
        this.number = number;
    }
    public void setUsername(String username) {
        this.username = username;
    }
    public String getUsername() {
        return this.username;
    }
    public void setCuisine_name(String cuisine_name) {
        this.cuisine_name = cuisine_name;
    }
    public String getCuisine_name() {
        return this.cuisine_name;
    }
    public void setNumber(int number) {
        this.number = number;
    }
    public int getNumber() {
        return this.number;
    }
}
