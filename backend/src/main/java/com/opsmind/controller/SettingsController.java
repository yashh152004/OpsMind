package com.opsmind.controller;

import com.opsmind.model.GlobalSetting;
import com.opsmind.repository.GlobalSettingRepository;
import com.opsmind.service.PlatformActivityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/settings")
public class SettingsController {
    private final GlobalSettingRepository repository;
    private final PlatformActivityService activityService;

    public SettingsController(GlobalSettingRepository repository, PlatformActivityService activityService) {
        this.repository = repository;
        this.activityService = activityService;
    }

    @GetMapping
    public ResponseEntity<Map<String, String>> getAllSettings() {
        return ResponseEntity.ok(repository.findAll().stream()
                .collect(Collectors.toMap(GlobalSetting::getSettingKey, GlobalSetting::getSettingValue)));
    }

    @PostMapping
    public ResponseEntity<Void> updateSettings(@RequestBody Map<String, String> settings) {
        settings.forEach((key, value) -> {
            GlobalSetting setting = repository.findById(key).orElse(new GlobalSetting(key, value, "GENERAL"));
            setting.setSettingValue(value);
            repository.save(setting);
        });
        activityService.logAction("SETTINGS_UPDATED", "SYSTEM", "system", "Global platform preferences modified.");
        return ResponseEntity.ok().build();
    }
}
