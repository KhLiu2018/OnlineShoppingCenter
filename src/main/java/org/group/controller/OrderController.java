package org.group.controller;

import org.apache.shiro.SecurityUtils;

import org.apache.shiro.subject.Subject;
import org.group.dao.UserDaoImpl;
import org.group.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.group.dao.CuisineDaoImpl;
import org.group.entity.Cuisine;
import java.util.List;
/**
 * Created by lincolnz9511 on 16-11-20.
 */
@Controller
public class OrderController {
    @ModelAttribute(value = "subject")
    public Subject subject() {
        return SecurityUtils.getSubject();
    }
    @Autowired
	private CuisineDaoImpl cuisineService;
    @Autowired
    private UserDaoImpl userService;
    private User user;
    @RequestMapping(value="/order/{city}")
    public String OrderDetailTemplate(@PathVariable("city")String city,
          @RequestParam("commodity1") int commodity1_amount, @RequestParam("commodity2") int commodity2_amount,
          @RequestParam("commodity3") int commodity3_amount, @RequestParam("commodity4") int commodity4_amount,
          @RequestParam("commodity5") int commodity5_amount, @RequestParam("commodity6") int commodity6_amount
            , Model model) {

        double totalPay = 0;
        String city1 = "Beijing";
        String city2 = "Shanghai";
        String city3 = "Guangzhou";
        String curCity = city3;
        Subject subject = SecurityUtils.getSubject();
        user = userService.findByName(subject.getPrincipal().toString());
        if (city != null) {
            curCity = city;
        }
        
        List<Cuisine> cuisines = cuisineService.findAllCuisine(curCity);
        model.addAttribute("amount1", Integer.toString(commodity1_amount));
        model.addAttribute("amount2", Integer.toString(commodity2_amount));
        model.addAttribute("amount3", Integer.toString(commodity3_amount));
        model.addAttribute("amount4", Integer.toString(commodity4_amount));
        model.addAttribute("amount5", Integer.toString(commodity5_amount));
        model.addAttribute("amount6", Integer.toString(commodity6_amount));


        model.addAttribute("commodity1", cuisines.get(0).getCuisine_name());
        model.addAttribute("commodity2", cuisines.get(1).getCuisine_name());
        model.addAttribute("commodity3",cuisines.get(2).getCuisine_name());
        model.addAttribute("commodity4", cuisines.get(3).getCuisine_name());
        model.addAttribute("commodity5", cuisines.get(4).getCuisine_name());
        model.addAttribute("commodity6", cuisines.get(5).getCuisine_name());
        totalPay = commodity1_amount*cuisines.get(0).getPrice()+commodity2_amount*cuisines.get(1).getPrice()+
                commodity3_amount*cuisines.get(2).getPrice()+commodity4_amount*cuisines.get(3).getPrice()+
                commodity5_amount*cuisines.get(4).getPrice()+commodity6_amount*cuisines.get(5).getPrice();
        if (user.getVip().equals("vip")) {
            model.addAttribute("vip","(Vip)");
            totalPay *= 0.95;
            model.addAttribute("price1", String.format("%.2f", cuisines.get(0).getPrice()*0.95));
            model.addAttribute("price2", String.format("%.2f", cuisines.get(1).getPrice()*0.95));
            model.addAttribute("price3",String.format("%.2f", cuisines.get(2).getPrice()*0.95));
            model.addAttribute("price4", String.format("%.2f", cuisines.get(3).getPrice()*0.95));
            model.addAttribute("price5", String.format("%.2f", cuisines.get(4).getPrice()*0.95));
            model.addAttribute("price6", String.format("%.2f", cuisines.get(5).getPrice()*0.95));
        } else {

            model.addAttribute("vip","(Normal)");
            model.addAttribute("price1", String.format("%.2f", cuisines.get(0).getPrice()));
            model.addAttribute("price2", String.format("%.2f", cuisines.get(1).getPrice()));
            model.addAttribute("price3",String.format("%.2f", cuisines.get(2).getPrice()));
            model.addAttribute("price4", String.format("%.2f", cuisines.get(3).getPrice()));
            model.addAttribute("price5", String.format("%.2f", cuisines.get(4).getPrice()));
            model.addAttribute("price6", String.format("%.2f", cuisines.get(0).getPrice()));
        }
        model.addAttribute("totalAmount", commodity1_amount+commodity2_amount+commodity3_amount+commodity4_amount+commodity5_amount+commodity6_amount);
        model.addAttribute("totalPay", String.format("%.2f", totalPay));
        return "order";
    }

}
