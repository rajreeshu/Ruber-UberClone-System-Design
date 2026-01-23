package org.system.design.uber.service;

import com.uber.h3core.H3Core;
import com.uber.h3core.util.LatLng;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.system.design.uber.config.AppProperties;
import org.system.design.uber.model.CoordinateModel;
import org.system.design.uber.model.TilesInfoModel;

import java.io.IOException;
import java.util.List;
import java.util.Objects;

@Service
public class H3Service {

    @Autowired
    private AppProperties appProperties;

    @Autowired
    private H3Core h3Core;

    public long getH3TileId(CoordinateModel coordinateModel) throws IOException {
        return h3Core.latLngToCell(coordinateModel.getLatitude(), coordinateModel.getLongitude(),
                (int)appProperties.getH3Resolution());
    }

    public List<TilesInfoModel> getNearbyTilesInfo(long tileId, int k) {
        return this.getNearbyTileIds(tileId, k).stream().filter(Objects::nonNull).map(nearbyTileId -> {
            List<CoordinateModel> nearbyTileBoundary = getTileBoundary(nearbyTileId);
            return new TilesInfoModel(String.valueOf(nearbyTileId), nearbyTileBoundary, null);
        }).filter(Objects::nonNull).toList();
    }

    public List<Long> getNearbyTileIds(long tileId, int k) {
        return h3Core.gridDisk(tileId, k);
    }


    public List<CoordinateModel> getTileBoundary(long tileId) {
        List<LatLng> latLng =  h3Core.cellToBoundary(tileId);
        return latLng.stream().filter(Objects::nonNull).map(latLng1 ->
                new CoordinateModel(latLng1.lat, latLng1.lng)).toList();
    }


}
