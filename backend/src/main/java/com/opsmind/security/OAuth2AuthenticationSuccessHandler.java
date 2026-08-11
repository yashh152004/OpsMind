package com.opsmind.security;

import com.opsmind.model.Organization;
import com.opsmind.model.User;
import com.opsmind.repository.OrganizationRepository;
import com.opsmind.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Collections;

@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final JwtTokenProvider jwtTokenProvider;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    public OAuth2AuthenticationSuccessHandler(UserRepository userRepository,
                                             OrganizationRepository organizationRepository,
                                             JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        if (response.isCommitted()) {
            return;
        }

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        if (email == null) {
            throw new ServletException("Email not provided by Google OAuth Provider");
        }

        // Find or provision user
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            String name = oAuth2User.getAttribute("name");
            String firstName = oAuth2User.getAttribute("given_name");
            String lastName = oAuth2User.getAttribute("family_name");
            String avatarUrl = oAuth2User.getAttribute("picture");

            if (firstName == null) {
                if (name != null) {
                    String[] parts = name.split(" ", 2);
                    firstName = parts[0];
                    lastName = parts.length > 1 ? parts[1] : "";
                } else {
                    firstName = "Google";
                    lastName = "User";
                }
            }
            if (lastName == null) {
                lastName = "";
            }

            // Find or create default organization
            Organization org = organizationRepository.findAll().stream().findFirst().orElseGet(() -> {
                Organization newOrg = Organization.builder()
                        .name("Default Global")
                        .build();
                return organizationRepository.save(newOrg);
            });

            User newUser = User.builder()
                    .email(email)
                    .firstName(firstName)
                    .lastName(lastName)
                    .password("GOOGLE_OAUTH_PROVISIONED")
                    .avatarUrl(avatarUrl)
                    .role("USER")
                    .status("ACTIVE")
                    .provider("GOOGLE")
                    .organizationId(org.getId())
                    .organizationName(org.getName())
                    .build();

            return userRepository.save(newUser);
        });

        // Set provider to GOOGLE if it is currently LOCAL/null (upgrade to oauth or mark it)
        if (!"GOOGLE".equals(user.getProvider())) {
            user.setProvider("GOOGLE");
            if (user.getAvatarUrl() == null || user.getAvatarUrl().isEmpty()) {
                String avatarUrl = oAuth2User.getAttribute("picture");
                if (avatarUrl != null) {
                    user.setAvatarUrl(avatarUrl);
                }
            }
            userRepository.save(user);
        }

        // Generate token for application authenticated principal
        Authentication userAuth = new UsernamePasswordAuthenticationToken(
                email, null, Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
        );
        String accessToken = jwtTokenProvider.generateToken(userAuth);

        String targetUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/oauth/callback")
                .queryParam("accessToken", accessToken)
                .queryParam("refreshToken", "fake-refresh-token")
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
