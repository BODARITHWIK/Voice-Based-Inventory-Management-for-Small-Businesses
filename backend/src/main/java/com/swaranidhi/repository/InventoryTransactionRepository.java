package com.swaranidhi.repository;

import com.swaranidhi.entity.InventoryTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, Long> {
    List<InventoryTransaction> findByBusinessIdOrderByTimestampDesc(Long businessId);
    Page<InventoryTransaction> findByBusinessIdOrderByTimestampDesc(Long businessId, Pageable pageable);
    List<InventoryTransaction> findByBusinessIdAndProductIdOrderByTimestampDesc(Long businessId, Long productId);
}
