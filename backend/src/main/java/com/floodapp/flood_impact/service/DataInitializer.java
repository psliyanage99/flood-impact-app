package com.floodapp.flood_impact.service;

import com.floodapp.flood_impact.model.User;
import com.floodapp.flood_impact.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {
    @Autowired
    private UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        // Check if Admin exists, if not, create it
        if (userRepository.findByEmail("admin@gmail.com").isEmpty()) {
            User admin = new User();
            admin.setName("System Administrator");
            admin.setEmail("admin@gmail.com");
            admin.setPassword("admin@12345"); // In a real production app, use BCrypt to hash this!
            admin.setRole("admin");
            userRepository.save(admin);
            System.out.println("Admin account created successfully.");
        }
    }
}
