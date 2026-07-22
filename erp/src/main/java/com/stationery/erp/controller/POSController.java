package com.stationery.erp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.stationery.erp.dto.CheckoutRequestDTO;
import com.stationery.erp.entity.Order;
import com.stationery.erp.service.POSOrderService;

@RestController
@RequestMapping("/api/pos")
@CrossOrigin(origins = "*")
public class POSController {

    @Autowired
    private POSOrderService posOrderService;

    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(@RequestBody CheckoutRequestDTO requestDTO) {
        try {
            Order completedOrder = posOrderService.processCheckout(requestDTO);
            return ResponseEntity.ok(completedOrder);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}