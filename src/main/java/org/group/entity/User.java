package org.group.entity;

import java.io.Serializable;

/**
 * Created by lincolnz9511 on 16-11-26.
 */
public class User implements Serializable {

    private static final long serialVersionUID = 1L;
    private String username,password,vip;
    private double account;

    public User() {
        this.username = "default";
        this.password = "default";
        this.account = 1;
        this.vip = "novip";
    }

    public User(String username,String password,double account, String vip) {
        this.username = username;
        this.password = password;
        this.account = account;
        this.vip = vip;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getUsername() {
        return this.username;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPassword() {
        return this.password;
    }

    public void setAccount(double account) {
        this.account = account;
    }

    public double getAccount() {
        return this.account;
    }

    public void setVip(String vip) {
        this.vip = vip;
    }

    public String getVip() {
        return this.vip;
    }

}
