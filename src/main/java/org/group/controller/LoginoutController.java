package org.group.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class LoginoutController {

    @RequestMapping(value="/loginout")
    public String loginoutTemplate() {

        return "loginout";
    }

}
