package org.system.design.uber.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.system.design.uber.model.DriverModel;
import org.system.design.uber.model.DriverStatus;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class RedisService {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    public void save(String key, DriverModel driverData) {
        List<DriverModel> value = get(key);
        if (value == null) {
            value = new ArrayList<>();
        }
        if(DriverStatus.AVAILABLE.equals(driverData.getStatus())) {
            // Only add available drivers to the list
            value.add(driverData);
        }else{
            value.removeIf(driver ->
                    driver.getDriverId() == driverData.getDriverId()
            );
        }
        redisTemplate.opsForValue().set(key, value);
    }

    public List<DriverModel> get(String key) {

        Object value = redisTemplate.opsForValue().get(key);

        if (value == null) {
            return new ArrayList<>();
        }

        return objectMapper.convertValue(
                value,
                new TypeReference<List<DriverModel>>() {
                }
        );
    }

    public void deleteAll() {
        var keys = redisTemplate.keys("*");
        if(!CollectionUtils.isEmpty(keys)) {
            redisTemplate.delete(keys);
        }
    }


    public Object delete(String key) {
        Object value = get(key);
        redisTemplate.delete(key);
        return value;
    }


}
