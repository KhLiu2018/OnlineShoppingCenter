package org.group.controller;

import org.apache.shiro.SecurityUtils;
import org.apache.shiro.authc.AuthenticationException;
import org.apache.shiro.authc.IncorrectCredentialsException;
import org.apache.shiro.authc.UnknownAccountException;
import org.apache.shiro.authc.UsernamePasswordToken;
import org.apache.shiro.crypto.hash.Md5Hash;
import org.apache.shiro.subject.Subject;
import org.group.dao.UserDaoImpl;
import org.group.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;


@Controller
public class LoginController {
    @Autowired
    private UserDaoImpl userService;
    private User user;

    @ModelAttribute(value = "subject")
    public Subject subject() {
        return SecurityUtils.getSubject();
    }

    @RequestMapping(value = {"/login","/login.html"}, method = RequestMethod.GET)
    protected String Glogin() {
        return "login";
    }

    @RequestMapping(value = {"/login","/login.html"}, method = RequestMethod.POST)
    protected String Plogin(@RequestParam("username") String username, @RequestParam("password") String password, Model model)  {

        userService.createTable();
        Subject subject = SecurityUtils.getSubject();
        UsernamePasswordToken token = new UsernamePasswordToken(username, password);

        if (userService.findByName("Lady@sysu.cn") == null) {
            String pas = new Md5Hash("13579","Lady@sysu.cn").toString();
            String pas2 = new Md5Hash("02468","Man@sysu.cn").toString();
            user  = new User("Lady@sysu.cn",pas,0.95,"vip");
            userService.createUser(user);
            user = new User("Man@sysu.cn",pas2,1,"normal");
            userService.createUser(user);
       }

        try{
            subject.login(token);
        } catch (UnknownAccountException e) {
            model.addAttribute("Suc",true);
            return "login";
        } catch (IncorrectCredentialsException e) {
            model.addAttribute("Suc",true);
            return "login";
        } catch (AuthenticationException e) {
            model.addAttribute("Suc",true);
            return "index";
        }
        model.addAttribute("Suc",false);
        model.addAttribute("name", username);
        model.addAttribute("subject", subject);
        return "loginsuccess";

    }
}
