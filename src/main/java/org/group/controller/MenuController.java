package org.group.controller;

import org.apache.shiro.SecurityUtils;
import org.apache.shiro.subject.Subject;
import org.group.dao.CuisineDaoImpl;
import org.group.entity.Cuisine;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;
/**
 * Created by lincolnz9511 on 16-11-20.
 */

@Controller
public class MenuController {
    @Autowired
	private CuisineDaoImpl cuisineService;
	private Cuisine cuisine;
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

    @RequestMapping(value={"/menu/{city}"})
    public String MenuTemplate(@PathVariable("city") String city, Model model) {
    	
        String city1 = "Beijing";
        String city2 = "Shanghai";
        String city3 = "Guangzhou";
        String curCity = city;

        model.addAttribute("curCity", curCity);

        String commodity_Guangzhou_pic[] = {"RiceRolls.jpg", "Porridge.jpg", "ChickenWings.jpg", "Hamburg.jpg", "FrenchFries.jpg", "Coffee.jpg"};
        String commodity_Shanghai_pic[] = {"Dumplings.jpg", "TreasuresRice.jpg", "HairyCrabs.jpg", "FriedBun.jpg", "RiceBalls.jpg", "Tea.jpg"};
        String commodity_Beijing_pic[] = {"RoastDuck.jpg", "SugarHaws.jpg", "Noodles.jpg", "BoiledMutton.jpg", "CaramelTreats.jpg", "PlumSyrup.jpg"};

        List<Cuisine> want = cuisineService.findAllCuisine(curCity);


        model.addAttribute("commodity1", want.get(0).getCuisine_name());
        model.addAttribute("commodity2", want.get(1).getCuisine_name());
        model.addAttribute("commodity3", want.get(2).getCuisine_name());
        model.addAttribute("commodity4", want.get(3).getCuisine_name());
        model.addAttribute("commodity5", want.get(4).getCuisine_name());
        model.addAttribute("commodity6", want.get(5).getCuisine_name());

        model.addAttribute("commodity1_pic", convertPictureName(want.get(0).getCuisine_name())+".jpg");
        model.addAttribute("commodity2_pic", convertPictureName(want.get(1).getCuisine_name())+".jpg");
        model.addAttribute("commodity3_pic", convertPictureName(want.get(2).getCuisine_name())+".jpg");
        model.addAttribute("commodity4_pic", convertPictureName(want.get(3).getCuisine_name())+".jpg");
        model.addAttribute("commodity5_pic", convertPictureName(want.get(4).getCuisine_name())+".jpg");
        model.addAttribute("commodity6_pic", convertPictureName(want.get(5).getCuisine_name())+".jpg");

        model.addAttribute("price1", want.get(0).getPrice());
        model.addAttribute("price2", want.get(1).getPrice());
        model.addAttribute("price3", want.get(2).getPrice());
        model.addAttribute("price4", want.get(3).getPrice());
        model.addAttribute("price5", want.get(4).getPrice());
        model.addAttribute("price6", want.get(5).getPrice());

        return "menu";
    }

}
