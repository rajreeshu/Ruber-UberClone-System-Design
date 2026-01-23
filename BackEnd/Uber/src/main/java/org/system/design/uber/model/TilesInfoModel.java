package org.system.design.uber.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TilesInfoModel {
    private String tileNumber;
    private List<CoordinateModel> tilesCoordinates;
    private List<TilesInfoModel> nearbyTiles;
}
