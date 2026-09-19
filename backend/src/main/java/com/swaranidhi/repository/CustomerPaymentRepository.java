package com.swaranidhi.repository;

import com.swaranidhi.entity.CustomerPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerPaymentRepository extends JpaRepository<CustomerPayment, Long> {
    List<CustomerPayment> findByCustomerIdOrderByRecordedAtDesc(Long customerId);
    List<CustomerPayment> findByBusinessIdOrderByRecordedAtDesc(Long businessId);
}
