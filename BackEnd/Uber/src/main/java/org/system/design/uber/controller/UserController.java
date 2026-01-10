package org.system.design.uber.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.system.design.uber.model.DriverModel;
import org.system.design.uber.service.AvailabilityService;
import org.system.design.uber.service.DriverService;
import org.system.design.uber.service.H3Service;

import java.util.List;

@RequestMapping("/user")
@Controller
@CrossOrigin(
        origins = "*",
        allowedHeaders = "*",
        methods = {RequestMethod.GET, RequestMethod.POST}
)
public class UserController {

    @Autowired
    private AvailabilityService availabilityService;


}
