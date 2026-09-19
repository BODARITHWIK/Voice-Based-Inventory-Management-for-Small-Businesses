package com.swaranidhi.repository;

import com.swaranidhi.entity.SaleItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SaleItemRepository extends JpaRepository<SaleItem, Long> {
    List<SaleItem> findBySaleId(Long saleId);

    @Query("SELECT si.product.id, SUM(si.quantity) FROM SaleItem si WHERE si.sale.business.id = :businessId AND si.sale.createdAt >= :since GROUP BY si.product.id")
    List<Object[]> findSalesVelocityByBusiness(@Param("businessId") Long businessId, @Param("since") LocalDateTime since);
}
