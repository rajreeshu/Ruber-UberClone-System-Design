package org.system.design.uber.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.system.design.uber.model.CoordinateModel;
import org.system.design.uber.model.TilesInfoModel;
import org.system.design.uber.service.H3Service;
import org.system.design.uber.service.RedisService;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RequestMapping("/map")
@Controller
@CrossOrigin(
        origins = "*",
        allowedHeaders = "*",
        methods = {RequestMethod.GET, RequestMethod.POST}
)
public class MapController {
    Logger logger = LoggerFactory.getLogger(MapController.class);

    @Autowired
    private H3Service h3Service;

    @Autowired
    private RedisService redisService;

    @GetMapping("/tiles/info")
    public ResponseEntity<?> getLocationTilesInfo(@RequestParam double latitude, @RequestParam double longitude, @RequestParam int gridSize) {
        try {
            if(gridSize ==1){
                redisService.deleteAll(); // Delete all Drivers for 1st request for Testing purpose.
            }

            long tileId = h3Service.getH3TileId(new CoordinateModel(latitude, longitude));
            List<CoordinateModel> tileBoundary = h3Service.getTileBoundary(tileId);
            List<TilesInfoModel> nearByTiles = h3Service.getNearbyTilesInfo(tileId, gridSize);
            return ResponseEntity.ok(new TilesInfoModel(String.valueOf(tileId), tileBoundary, nearByTiles));
        } catch (IOException e) {
            logger.error("Error in fetching tile info for location: {}, {}", latitude, longitude, e);
            return ResponseEntity.internalServerError().body("Error in fetching tile info");
        }

    }

    @GetMapping("/tile")
    public ResponseEntity<?> getTileId(@RequestParam double latitude, @RequestParam double longitude) {
        try {
            long tileId = h3Service.getH3TileId(new CoordinateModel(latitude, longitude));
            return ResponseEntity.ok(Map.of("tileId", String.valueOf(tileId)));
        } catch (IOException e) {
            logger.error("Error in fetching tile id for location: {}, {}", latitude, longitude, e);
            return ResponseEntity.internalServerError().body("Error in fetching tile id");
        }
    }
}
