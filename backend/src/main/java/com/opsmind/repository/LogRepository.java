package com.opsmind.repository;

import com.opsmind.model.LogEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LogRepository extends JpaRepository<LogEntry, Long> {
    List<LogEntry> findByLevelOrderByTimestampDesc(String level);
    List<LogEntry> findTop100ByOrderByTimestampDesc();
}
