package com.opsmind.repository;

import com.opsmind.model.SystemMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SystemMetricRepository extends JpaRepository<SystemMetric, Long> {
    List<SystemMetric> findByMetricNameOrderByTimestampDesc(String name);
    List<SystemMetric> findTop50ByMetricNameOrderByTimestampDesc(String name);
}
