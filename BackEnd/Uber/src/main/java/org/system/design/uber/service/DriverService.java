package org.system.design.uber.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.system.design.uber.model.DriverModel;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
public class DriverService {

    @Autowired
    private RedisService redisService;

    @Autowired
    private H3Service h3Service;

    public ResponseEntity<?> registerDriver(DriverModel driverData) {
        // Implementation for registering a driver
        try {
            long h3TileId = h3Service.getH3TileId(driverData.getCurrentLocation());
            redisService.save(String.valueOf(h3TileId), driverData);
            return ResponseEntity.ok(Map.of("message", "Driver registered successfully", "h3TileId", String.valueOf(h3TileId)));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

    }

    public List<DriverModel> driverInTile(long h3TileId) {
        return redisService.get(String.valueOf(h3TileId));
    }

    public ResponseEntity<?> logOutAllDriver(){
        redisService.deleteAll();
        return ResponseEntity.ok("All drivers logged out successfully");
    }
}
