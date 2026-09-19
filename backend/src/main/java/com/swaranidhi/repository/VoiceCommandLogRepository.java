package com.swaranidhi.repository;

import com.swaranidhi.entity.VoiceCommandLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VoiceCommandLogRepository extends JpaRepository<VoiceCommandLog, Long> {
    List<VoiceCommandLog> findByBusinessIdOrderByCreatedAtDesc(Long businessId);
}
