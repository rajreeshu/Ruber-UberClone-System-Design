package org.system.design.uber.controller;

import io.netty.util.internal.ObjectUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.util.ObjectUtils;
import org.springframework.web.bind.annotation.*;
import org.system.design.uber.model.DriverModel;
import org.system.design.uber.service.AvailabilityService;
import org.system.design.uber.service.DriverService;
import org.system.design.uber.service.RedisService;

import java.util.List;

@Controller
@RequestMapping("/driver")
@CrossOrigin(
        origins = "*",
        allowedHeaders = "*",
        methods = {RequestMethod.GET, RequestMethod.POST}
)
public class DriverController {

    @Autowired
    private DriverService driverService;

    @Autowired
    private AvailabilityService availabilityService;

    @DeleteMapping("/logout/all")
    public ResponseEntity<?> logOutAllDriver(){
        return driverService.logOutAllDriver();
    }

    @PostMapping("/online")
    public ResponseEntity<?> addDriversToRedis(@RequestBody DriverModel driverData){
        if(ObjectUtils.isEmpty(driverData.getCurrentLocation()) || ObjectUtils.isEmpty(driverData.getDriverId()))
            return ResponseEntity.badRequest().body("Current Location and TileId cannot be null");
        return driverService.registerDriver(driverData);
    }

    @GetMapping("/available")
    public ResponseEntity<?> getNearestDrivers(@RequestParam long h3TileId) {
        List<DriverModel> driverList = availabilityService.getNearByAvailableDrivers(h3TileId);
        return ResponseEntity.ok(driverList);
    }
}
