package com.stationery.erp.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.stationery.erp.entity.Product;
import com.stationery.erp.repository.ProductRepository;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    // 1. Lấy danh sách sản phẩm
    @GetMapping
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // 2. Lấy sản phẩm theo mã SKU
    @GetMapping("/sku/{sku}")
    public Product getBySku(@PathVariable String sku) {
        return productRepository.findBySku(sku)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));
    }

    // 3. Thêm sản phẩm mới vào kho
    @PostMapping
    public Product createProduct(@RequestBody Product product) {
        return productRepository.save(product);
    }

    // 4. MỚI THÊM: API Cập nhật số lượng tồn kho trực tiếp
    @PutMapping("/{id}/stock")
    public Product updateStock(@PathVariable Long id, @RequestParam Integer quantity) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với ID: " + id));
        
        if (quantity < 0) {
            throw new IllegalArgumentException("Số lượng tồn kho không được nhỏ hơn 0!");
        }
        
        product.setStockQuantity(quantity);
        return productRepository.save(product);
    }
}