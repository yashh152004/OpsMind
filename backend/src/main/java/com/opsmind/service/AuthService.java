package com.opsmind.service;

import com.opsmind.dto.AuthResponse;
import com.opsmind.dto.LoginRequest;
import com.opsmind.dto.RegisterRequest;
import com.opsmind.model.User;
import com.opsmind.repository.UserRepository;
import com.opsmind.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@lombok.RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final com.opsmind.repository.OrganizationRepository organizationRepository;

    public AuthResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = jwtTokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(loginRequest.getEmail()).orElseThrow();

        return AuthResponse.builder()
                .accessToken(token)
                .refreshToken("fake-refresh-token") // Simplified
                .user(AuthResponse.UserData.builder()
                        .email(user.getEmail())
                        .firstName(user.getFirstName())
                        .lastName(user.getLastName())
                        .organizationId(user.getOrganizationId())
                        .role(user.getRole())
                        .build())
                .build();
    }

    public String register(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("Email already exists!");
        }

        // Create Organization
        com.opsmind.model.Organization org = com.opsmind.model.Organization.builder()
                .name(registerRequest.getOrganizationName())
                .build();
        org = organizationRepository.save(org);

        User user = User.builder()
                .firstName(registerRequest.getFirstName())
                .lastName(registerRequest.getLastName())
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .organizationId(org.getId())
                .organizationName(org.getName())
                .role("ADMIN")
                .build();

        userRepository.save(user);
        return "User registered successfully!";
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("NOT_AUTHENTICATED: Logic shard requires valid session.");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("USER_NOT_FOUND: Identity sync failure."));
    }
}
