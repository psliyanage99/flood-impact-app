package com.floodapp.flood_impact.controller;

import com.floodapp.flood_impact.model.Report;
import com.floodapp.flood_impact.repository.ReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "http://localhost:5173")
public class ReportController {
    @Autowired
    private ReportRepository reportRepository;

    // Get All Reports
    @GetMapping
    public List<Report> getAllReports() {
        return reportRepository.findAll();
    }

    // Create Report
    @PostMapping
    public Report createReport(@RequestBody Report report) {
        if (report.getStatus() == null || report.getStatus().isEmpty()) {
            report.setStatus("active");
        }
        return reportRepository.save(report);
    }

    // --- NEW: Resolve Report (Removes from Map, Updates Stats) ---
    @PutMapping("/{id}/resolve")
    public ResponseEntity<Report> resolveReport(@PathVariable Long id) {
        Optional<Report> reportOpt = reportRepository.findById(id);
        if (reportOpt.isPresent()) {
            Report report = reportOpt.get();
            report.setStatus("resolved"); // Mark as resolved in DB
            final Report updatedReport = reportRepository.save(report);
            return ResponseEntity.ok(updatedReport);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}