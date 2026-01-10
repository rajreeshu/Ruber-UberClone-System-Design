package org.system.design.uber.model;

import lombok.Data;

@Data
public class DriverModel {
    private int driverId;
    private CoordinateModel currentLocation;
    private DriverStatus status;
    private Long tileId;
}
