package com.opsmind.controller;

import com.opsmind.model.User;
import com.opsmind.repository.UserRepository;
import com.opsmind.service.PlatformActivityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {
    private final UserRepository repository;
    private final PlatformActivityService activityService;

    public UserController(UserRepository repository, PlatformActivityService activityService) {
        this.repository = repository;
        this.activityService = activityService;
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(repository.findAll());
    }

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        if (user.getRole() == null) user.setRole("OPERATOR");
        if (user.getStatus() == null) user.setStatus("ACTIVE");
        User saved = repository.save(user);
        activityService.logAction("USER_CREATED", "SETTINGS", "system", "New user created: " + saved.getEmail());
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        repository.deleteById(id);
        activityService.logAction("USER_DELETED", "SETTINGS", "system", "User id " + id + " revoked.");
        return ResponseEntity.ok().build();
    }
}
