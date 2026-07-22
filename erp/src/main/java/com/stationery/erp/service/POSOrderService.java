package com.stationery.erp.service;

import com.stationery.erp.dto.CheckoutRequestDTO;
import com.stationery.erp.entity.Order;
import com.stationery.erp.entity.OrderDetail;
import com.stationery.erp.entity.Product;
import com.stationery.erp.repository.OrderRepository;
import com.stationery.erp.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class POSOrderService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Transactional // Đảm bảo tính nguyên tử: Xảy ra lỗi sẽ Rollback toàn bộ
    public Order processCheckout(CheckoutRequestDTO checkoutDTO) {
        Order order = new Order();
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (CheckoutRequestDTO.CartItemDTO itemDTO : checkoutDTO.getItems()) {
            Product product = productRepository.findById(itemDTO.getProductId())
                    .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại ID: " + itemDTO.getProductId()));

            // Kiểm tra tồn kho
            if (product.getStockQuantity() < itemDTO.getQuantity()) {
                throw new RuntimeException("Sản phẩm " + product.getProductName() + " không đủ hàng trong kho!");
            }

            // 1. Tự động trừ số lượng tồn kho
            product.setStockQuantity(product.getStockQuantity() - itemDTO.getQuantity());
            productRepository.save(product);

            // 2. Tạo chi tiết hóa đơn
            OrderDetail detail = new OrderDetail();
            detail.setOrder(order);
            detail.setProduct(product);
            detail.setQuantity(itemDTO.getQuantity());
            detail.setUnitPrice(product.getRetailPrice());

            order.getOrderDetails().add(detail);

            // Tính tổng tiền
            BigDecimal itemSubtotal = product.getRetailPrice().multiply(BigDecimal.valueOf(itemDTO.getQuantity()));
            totalAmount = totalAmount.add(itemSubtotal);
        }

        order.setTotalAmount(totalAmount);
        BigDecimal discount = checkoutDTO.getDiscountAmount() != null ? checkoutDTO.getDiscountAmount() : BigDecimal.ZERO;
        order.setDiscountAmount(discount);
        order.setFinalAmount(totalAmount.subtract(discount));

        return orderRepository.save(order);
    }
}