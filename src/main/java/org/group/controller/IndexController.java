package org.group.controller;

import org.apache.shiro.SecurityUtils;
import org.apache.shiro.subject.Subject;
import org.group.dao.CuisineDaoImpl;
import org.group.entity.Cuisine;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import javax.servlet.http.HttpSession;
import java.io.UnsupportedEncodingException;
import java.util.List;
@Controller
public class IndexController {
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

    @SuppressWarnings("Duplicates")
    @RequestMapping(value={"/", "/index.html", "/index", "/index/*" })
    public String home(HttpSession session, @RequestParam(value = "city", required = false) String city, Model model) throws UnsupportedEncodingException {
        String name = "World";
        String city1 = "Beijing";
        String city2 = "Shanghai";
        String city3 = "Guangzhou";
        String curCity = city3;
        cuisineService.createTable();
        if (city != null) {
            curCity = city;
            System.out.println("CITY"+city);
        }


        session.setAttribute("CITY", curCity);

        model.addAttribute("curCity", curCity);
        model.addAttribute("city1", city1);
        model.addAttribute("city2", city2);
        model.addAttribute("city3", city3);

        //第一次进入的时候录入数据，之后不用。
        if (cuisineService.findByName("Rice rolls") == null) {
        /* 三个城市的商品，价格，图片*/
        String commodity_Guangzhou[] = {"Rice rolls", "Porridge", "Chicken wings", "Hamburg", "French fries", "Coffee"};
        
        String gz_description[] = {"Rice Rolls is a Chinese tradition food, which is made of rice and is produced by pouring rice milk into stream machine.",
        		"Porridge is a Chinese traditional food. The means to make porridge are that you can mix water and rice into one pot and boil about half an hour.",
        		"Chicken wings is really delicious, there is no reason you should not order it!",
        		"Hamburg is man-made, and it contains fresh vegetables, meat and bread. Don't you dare omit it!",
        		"We use fresh potatoes to make French Fries, and we make save it's warm when it goes into your month.",
        		"Coffee in our store is fantastic. We use expensive coffee beans to boil, and it is one of the best items in our store."};
       String sh_description[]  = {"They are made of delicious soup and fresh meat. It is an unforgettable experience to swallow them.",
        		"It is sweet and really healthy food. It is certainly good to your health.",
        		"We use fresh and alive to cook, which originated from Yangcheng Lake.",
        		"Fried buns is a meat bun which is fried and really religious.",
        		"They are made by rice balls and some other sweet material like red beans and longans.",
        		"We use high class tea leaves and fresh water to boil the tea. We save that it is worth trying!"};
       
       String bj_description[] = {"Beijing Roast Duck is one of the most famous dishes in China, which is beyond description.",
        		 "It is well-known dessert in China, which is favored by most people.",
        		 "Noodles with soybean paste is famous for its fantastic taste. When you eat this meal, all you feel is fucking awesome.",
        		 "Mutton in hot pot is very suitable for dinner when the temperature is getting low. It makes you feel warm and really good for your sexual health.",
        		 "It is a cheap and delicious dessert.",
        		 "Syrup of Plum is thirst-quenching and good for your throat."};
        Double price_Guangzhou[] = {12.00, 10.00, 12.00, 23.00, 11.00, 20.00};
        String commodity_Shanghai[] = {"Dumplings", "Treasures rice", "Hairy crabs", "Fried bun", "Rice balls", "Tea"};
 
        Double price_Shanghai[] = {20.00, 15.00, 35.00, 18.00, 12.00, 10.00};
        String commodity_Beijing[] = {"Roast duck", "Sugar haws", "Noodles", "Boiled mutton", "Caramel treats", "Plum syrup"};
       
        Double price_Beijing[] = {45.00, 7.00, 12.00, 60.00, 8.00, 8.00};
        for (int i = 0; i < 6; i++) {
            cuisine = new Cuisine(commodity_Guangzhou[i], gz_description[i], price_Guangzhou[i], city3);
            cuisineService.createCuisine(cuisine);
        }
        for (int i = 0; i < 6; i++) {
                cuisine = new Cuisine(commodity_Shanghai[i], sh_description[i], price_Guangzhou[i], city2);
                cuisineService.createCuisine(cuisine);
            }
            for (int i = 0; i < 6; i++) {
                cuisine = new Cuisine(commodity_Beijing[i], bj_description[i], price_Beijing[i], city1);
                cuisineService.createCuisine(cuisine);
            }

        }
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

        return "index";
    }

}
