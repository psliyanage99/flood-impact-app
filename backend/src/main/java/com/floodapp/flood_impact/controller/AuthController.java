package com.floodapp.flood_impact.controller;

import com.floodapp.flood_impact.model.User;
import com.floodapp.flood_impact.repository.UserRepository;
import com.floodapp.flood_impact.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @PostMapping("/register")
    public User register(@RequestBody User user) {
        // Ensure regular registration always sets role to "user"
        user.setRole("user");
        return userRepository.save(user);
    }

    @PostMapping("/login")
    public User login(@RequestBody User loginRequest) {
        return userRepository.findByEmail(loginRequest.getEmail())
                .filter(u -> u.getPassword().equals(loginRequest.getPassword()))
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));
    }

    @PostMapping("/google")
    public User loginWithGoogle(@RequestBody Map<String, String> payload) {
        String accessToken = payload.get("token");
        String googleUserInfoUrl = "https://www.googleapis.com/oauth2/v3/userinfo";
        RestTemplate restTemplate = new RestTemplate();

        try {
            String url = googleUserInfoUrl + "?access_token=" + accessToken;
            Map<String, Object> googleUser = restTemplate.getForObject(url, Map.class);

            String email = (String) googleUser.get("email");
            String name = (String) googleUser.get("name");

            Optional<User> existingUser = userRepository.findByEmail(email);

            if (existingUser.isPresent()) {
                return existingUser.get();
            } else {
                User newUser = new User();
                newUser.setEmail(email);
                newUser.setName(name);
                newUser.setRole("user");
                newUser.setPassword("GOOGLE_AUTH");
                return userRepository.save(newUser);
            }
        } catch (Exception e) {
            throw new RuntimeException("Invalid Google Token");
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        Optional<User> user = userRepository.findByEmail(email);

        if (user.isPresent()) {
            try {
                emailService.sendResetEmail(email);
                Map<String, String> response = new HashMap<>();
                response.put("message", "Reset link sent successfully to " + email);
                return ResponseEntity.ok(response);
            } catch (Exception e) {
                e.printStackTrace();
                return ResponseEntity.internalServerError()
                        .body(Map.of("message", "Error sending email. Check server logs."));
            }
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "Email not found"));
        }
    }
}