package com.swaranidhi.repository;

import com.swaranidhi.entity.Purchase;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PurchaseRepository extends JpaRepository<Purchase, Long> {
    List<Purchase> findByBusinessIdOrderByCreatedAtDesc(Long businessId);
    Page<Purchase> findByBusinessIdOrderByCreatedAtDesc(Long businessId, Pageable pageable);
    Optional<Purchase> findByIdAndBusinessId(Long id, Long businessId);
    Optional<Purchase> findByPurchaseNumberAndBusinessId(String purchaseNumber, Long businessId);
    Optional<Purchase> findByIdempotencyKeyAndBusinessId(String idempotencyKey, Long businessId);

    @Query("SELECT COALESCE(SUM(p.total), 0) FROM Purchase p WHERE p.business.id = :businessId AND p.createdAt >= :startDate AND p.createdAt <= :endDate")
    BigDecimal sumTotalByBusinessIdAndDateRange(@Param("businessId") Long businessId,
                                                @Param("startDate") LocalDateTime startDate,
                                                @Param("endDate") LocalDateTime endDate);
}
