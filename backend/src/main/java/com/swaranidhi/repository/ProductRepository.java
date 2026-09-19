package com.swaranidhi.repository;

import com.swaranidhi.entity.Product;
import com.swaranidhi.entity.StockStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByBusinessIdAndActiveTrue(Long businessId);

    Page<Product> findByBusinessIdAndActiveTrue(Long businessId, Pageable pageable);

    Optional<Product> findByIdAndBusinessId(Long id, Long businessId);

    Optional<Product> findByBusinessIdAndSku(Long businessId, String sku);

    Optional<Product> findByBusinessIdAndBarcode(Long businessId, String barcode);

    List<Product> findByBusinessIdAndStatusAndActiveTrue(Long businessId, StockStatus status);

    long countByBusinessIdAndActiveTrue(Long businessId);

    long countByBusinessIdAndStatusAndActiveTrue(Long businessId, StockStatus status);

    @Query("SELECT p FROM Product p WHERE p.business.id = :businessId AND p.active = true AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.sku) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.category) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Product> searchProducts(@Param("businessId") Long businessId, @Param("query") String query);

    @Query("SELECT p FROM Product p WHERE p.business.id = :businessId AND p.active = true AND " +
           "LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    Optional<Product> findFirstByNameContainingIgnoreCase(@Param("businessId") Long businessId, @Param("name") String name);
}
