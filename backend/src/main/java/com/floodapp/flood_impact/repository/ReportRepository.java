package com.floodapp.flood_impact.repository;

import com.floodapp.flood_impact.model.Report;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReportRepository extends JpaRepository<Report, Long> {
}
