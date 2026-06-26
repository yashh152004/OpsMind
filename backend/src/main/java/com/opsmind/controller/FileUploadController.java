package com.opsmind.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/storage")
public class FileUploadController {

    private final String UPLOAD_DIR = "uploads/";

    public FileUploadController() {
        try {
            Files.createDirectories(Paths.get(UPLOAD_DIR));
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize upload directory");
        }
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
        }

        try {
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path path = Paths.get(UPLOAD_DIR + fileName);
            Files.copy(file.getInputStream(), path);

            // In a real production app, this would be an S3 URL or similar
            String fileUrl = "http://localhost:8080/api/storage/files/" + fileName;
            
            return ResponseEntity.ok(Map.of("url", fileUrl, "fileName", fileName));
        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to store file: " + e.getMessage()));
        }
    }

    @GetMapping("/files/{fileName}")
    public ResponseEntity<byte[]> getFile(@PathVariable String fileName) {
        try {
            Path path = Paths.get(UPLOAD_DIR + fileName);
            byte[] data = Files.readAllBytes(path);
            String contentType = Files.probeContentType(path);
            
            return ResponseEntity.ok()
                    .header("Content-Type", contentType != null ? contentType : "application/octet-stream")
                    .body(data);
        } catch (IOException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
