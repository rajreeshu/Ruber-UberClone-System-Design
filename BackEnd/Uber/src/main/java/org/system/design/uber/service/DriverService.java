package org.system.design.uber.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
//import org.system.design.uber.entity.DriverInfoEntity;
import org.system.design.uber.model.DriverModel;
//import org.system.design.uber.repository.DriverInfoRepository;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
public class DriverService {

    @Autowired
    private RedisService redisService;

    @Autowired
    private H3Service h3Service;

//    @Autowired
//    private DriverInfoRepository driverInfoRepository;

    public ResponseEntity<?> registerDriver(DriverModel driverData) {
        // Implementation for registering a driver
        try {
            long h3TileId = h3Service.getH3TileId(driverData.getCurrentLocation());
            redisService.save(String.valueOf(h3TileId), driverData);
            saveDriverToDb(driverData, h3TileId);
            return ResponseEntity.ok(Map.of("message", "Driver registered successfully", "h3TileId", String.valueOf(h3TileId)));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

    }

    private void saveDriverToDb(DriverModel driverData, long h3TileId) {
        // Implementation for saving driver to DB
//        DriverInfoEntity driverInfoEntity = new DriverInfoEntity();
//        driverInfoEntity.setDriverId(String.valueOf(driverData.getDriverId()));
//        driverInfoEntity.setLocation(String.valueOf(h3TileId));
//
//        driverInfoRepository.save(driverInfoEntity);

    }

    public List<DriverModel> driverInTile(long h3TileId) {
        return redisService.get(String.valueOf(h3TileId));
    }

    public ResponseEntity<?> logOutAllDriver(){
        redisService.deleteAll();
        return ResponseEntity.ok("All drivers logged out successfully");
    }
}
