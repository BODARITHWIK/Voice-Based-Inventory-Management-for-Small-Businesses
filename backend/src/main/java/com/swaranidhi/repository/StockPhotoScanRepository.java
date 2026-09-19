package com.swaranidhi.repository;

import com.swaranidhi.entity.StockPhotoScan;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StockPhotoScanRepository extends JpaRepository<StockPhotoScan, Long> {

    List<StockPhotoScan> findByBusinessIdOrderByCreatedAtDesc(Long businessId);

    Page<StockPhotoScan> findByBusinessIdOrderByCreatedAtDesc(Long businessId, Pageable pageable);

    Optional<StockPhotoScan> findByIdAndBusinessId(Long id, Long businessId);

    List<StockPhotoScan> findByBusinessIdAndStatusOrderByCreatedAtDesc(Long businessId, String status);

    long countByBusinessId(Long businessId);
}
