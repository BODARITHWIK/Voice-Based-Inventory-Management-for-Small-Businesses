package com.swaranidhi.repository;

import com.swaranidhi.entity.Sale;
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
public interface SaleRepository extends JpaRepository<Sale, Long> {
    List<Sale> findByBusinessIdOrderByCreatedAtDesc(Long businessId);
    Page<Sale> findByBusinessIdOrderByCreatedAtDesc(Long businessId, Pageable pageable);
    Optional<Sale> findByIdAndBusinessId(Long id, Long businessId);
    Optional<Sale> findByInvoiceNumberAndBusinessId(String invoiceNumber, Long businessId);
    Optional<Sale> findByIdempotencyKeyAndBusinessId(String idempotencyKey, Long businessId);

    @Query("SELECT COALESCE(SUM(s.total), 0) FROM Sale s WHERE s.business.id = :businessId AND s.createdAt >= :startDate AND s.createdAt <= :endDate")
    BigDecimal sumTotalByBusinessIdAndDateRange(@Param("businessId") Long businessId,
                                                @Param("startDate") LocalDateTime startDate,
                                                @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(s) FROM Sale s WHERE s.business.id = :businessId AND s.createdAt >= :startDate AND s.createdAt <= :endDate")
    long countSalesByBusinessIdAndDateRange(@Param("businessId") Long businessId,
                                            @Param("startDate") LocalDateTime startDate,
                                            @Param("endDate") LocalDateTime endDate);
}
