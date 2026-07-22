package com.stationery.erp.dto;

import java.math.BigDecimal;
import java.util.List;

import lombok.Data;

@Data
public class CheckoutRequestDTO {
    private BigDecimal discountAmount;
    private List<CartItemDTO> items;

    @Data
    public static class CartItemDTO {
        private Long productId;
        private Integer quantity;
    }
}