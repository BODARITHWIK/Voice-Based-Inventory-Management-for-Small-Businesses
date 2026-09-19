package com.swaranidhi.repository;

import com.swaranidhi.entity.SupplierPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupplierPaymentRepository extends JpaRepository<SupplierPayment, Long> {
    List<SupplierPayment> findBySupplierIdOrderByRecordedAtDesc(Long supplierId);
    List<SupplierPayment> findByBusinessIdOrderByRecordedAtDesc(Long businessId);
}
