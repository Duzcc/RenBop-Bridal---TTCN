package com.renbobridal.module.product.repository;

import com.renbobridal.module.product.entity.ProductItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductItemRepository extends JpaRepository<ProductItem, Long> {
    Optional<ProductItem> findBySku(String sku);
    List<ProductItem> findByProductId(Long productId);
    List<ProductItem> findByProductIdAndSizeAndStatus(Long productId, String size, ProductItem.Status status);
    boolean existsBySku(String sku);
}
