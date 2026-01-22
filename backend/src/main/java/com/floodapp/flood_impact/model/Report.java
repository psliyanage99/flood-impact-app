package com.floodapp.flood_impact.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "reports")
public class Report {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String district;
    private String location;
    private String type;        // Used for "Infrastructure Damage Distribution"
    private String criticality; // Used for "Severity Index"

    @Column(columnDefinition = "TEXT")
    private String description;

    private Double latitude;
    private Double longitude;
    private String reporterName;
    private String contactNumber;

    // KEY UPDATE 1: Default status to "active" so the dashboard counts it properly
    private String status = "active";

    // KEY UPDATE 2: Format date so 'new Date()' in JS works
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime timestamp = LocalDateTime.now();
}