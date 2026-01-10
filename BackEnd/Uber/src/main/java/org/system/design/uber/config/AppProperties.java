package org.system.design.uber.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@Getter
public class AppProperties {
    @Value("${map.h3.resolution}")
    private double h3Resolution;
}
