package com.stationery.erp.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.stationery.erp.entity.Order;

public interface OrderRepository extends JpaRepository<Order, Long> {}