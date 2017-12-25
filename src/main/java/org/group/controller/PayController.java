package org.group.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

/**
 * Created by lincolnz9511 on 16-12-4.
 */
@Controller
public class PayController {
    @RequestMapping(value="/paySuccess", method = RequestMethod.POST)
    public String paySuccessTemplate() {
        return "paySuccess";
    }
}
