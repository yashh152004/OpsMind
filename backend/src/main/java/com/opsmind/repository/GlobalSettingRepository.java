package com.opsmind.repository;

import com.opsmind.model.GlobalSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GlobalSettingRepository extends JpaRepository<GlobalSetting, String> {
    List<GlobalSetting> findByCategory(String category);
}
