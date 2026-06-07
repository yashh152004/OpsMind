package com.opsmind.controller;

import com.opsmind.model.User;
import com.opsmind.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        return ResponseEntity.ok(user);
    }
}
