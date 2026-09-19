package com.swaranidhi.repository;

import com.swaranidhi.entity.Supplier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    List<Supplier> findByBusinessIdOrderByNameAsc(Long businessId);
    Page<Supplier> findByBusinessIdOrderByNameAsc(Long businessId, Pageable pageable);
    Optional<Supplier> findByIdAndBusinessId(Long id, Long businessId);

    @Query("SELECT s FROM Supplier s WHERE s.business.id = :businessId AND " +
           "(LOWER(s.name) LIKE LOWER(CONCAT('%', :query, '%')) OR s.phone LIKE CONCAT('%', :query, '%'))")
    List<Supplier> searchSuppliers(@Param("businessId") Long businessId, @Param("query") String query);

    @Query("SELECT s FROM Supplier s WHERE s.business.id = :businessId AND LOWER(s.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    Optional<Supplier> findFirstByBusinessIdAndNameContainingIgnoreCase(@Param("businessId") Long businessId, @Param("name") String name);

    @Query("SELECT COALESCE(SUM(s.outstandingBalance), 0) FROM Supplier s WHERE s.business.id = :businessId AND s.outstandingBalance > 0")
    BigDecimal sumTotalOutstandingPayables(@Param("businessId") Long businessId);
}
