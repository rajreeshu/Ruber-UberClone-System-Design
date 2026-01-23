package org.system.design.uber.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.system.design.uber.model.CoordinateModel;
import org.system.design.uber.model.DriverModel;

import java.util.ArrayList;
import java.util.List;

@Service
public class AvailabilityService {

    @Autowired
    private H3Service h3Service;

    @Autowired
    private DriverService driverService;

    public List<DriverModel> getNearByAvailableDrivers(long h3TileId, int gridSize) {
        // get nearby tiles
        List<Long> h3Tileids = h3Service.getNearbyTileIds(h3TileId, gridSize);
        List<DriverModel> availableDrivers = new ArrayList<>();
        for(Long nearbyTileId : h3Tileids){
            List<DriverModel> driversInNearbyTile = driverService.driverInTile(nearbyTileId);
            availableDrivers.addAll(driversInNearbyTile);
        }
        return availableDrivers; // Placeholder return
    }
}
