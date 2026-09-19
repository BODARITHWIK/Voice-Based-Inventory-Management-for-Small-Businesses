package com.swaranidhi.repository;

import com.swaranidhi.entity.Customer;
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
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    List<Customer> findByBusinessIdOrderByNameAsc(Long businessId);
    Page<Customer> findByBusinessIdOrderByNameAsc(Long businessId, Pageable pageable);
    Optional<Customer> findByIdAndBusinessId(Long id, Long businessId);
    Optional<Customer> findByBusinessIdAndPhone(Long businessId, String phone);

    @Query("SELECT c FROM Customer c WHERE c.business.id = :businessId AND " +
           "(LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) OR c.phone LIKE CONCAT('%', :query, '%'))")
    List<Customer> searchCustomers(@Param("businessId") Long businessId, @Param("query") String query);

    @Query("SELECT c FROM Customer c WHERE c.business.id = :businessId AND LOWER(c.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    Optional<Customer> findFirstByBusinessIdAndNameContainingIgnoreCase(@Param("businessId") Long businessId, @Param("name") String name);

    @Query("SELECT COALESCE(SUM(c.currentBalance), 0) FROM Customer c WHERE c.business.id = :businessId AND c.currentBalance > 0")
    BigDecimal sumTotalOutstandingKhata(@Param("businessId") Long businessId);
}
