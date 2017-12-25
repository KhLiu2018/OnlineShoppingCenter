package org.group.controller;


import org.apache.shiro.SecurityUtils;
import org.apache.shiro.subject.Subject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.HashMap;
import java.util.Map;
import org.group.dao.CuisineDaoImpl;
import org.group.entity.Cuisine;
import java.util.List;
/**
 * Created by lincolnz9511 on 16-11-20.
 */
@Controller
public class CuisineDetailController {
    @Autowired
	private CuisineDaoImpl cuisineService;
	private Cuisine cuisine_entity;

    @ModelAttribute(value = "subject")
    public Subject subject() {
        return SecurityUtils.getSubject();
    }

    public String convertPictureName(String cuisine) {
        String[] arr = cuisine.split(" ");
        String picName = "";
        for (int i = 0; i < arr.length; ++i) {
            String temp =  arr[i].toUpperCase();
            temp = temp.substring(0,1);
            picName += temp+arr[i].substring(1);
        }
        return picName;
    }

    @RequestMapping(value="/cuisine_detail")
    public String CuisineDetailTemplate(@RequestParam(value = "cuisine", required = true) String cuisine, Model model) {

        cuisine_entity =  cuisineService.findByName(cuisine);
        model.addAttribute("commodity", cuisine);
        model.addAttribute("commodity_Detail", cuisine_entity.getDescription());
        String picNamePre = convertPictureName(cuisine);
        model.addAttribute("commodity_pic1", picNamePre+"1.jpg");
        model.addAttribute("commodity_pic2", picNamePre+"2.jpg");
        model.addAttribute("commodity_pic3", picNamePre+"3.jpg");
        model.addAttribute("commodity_Price", cuisine_entity.getPrice());

        return "cuisine_detail";
    }

}
