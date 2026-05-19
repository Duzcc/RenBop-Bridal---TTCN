package com.renbobridal.module.product.repository;

import com.renbobridal.module.product.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findBySlug(String slug);

    long countByCategoryId(Long categoryId);

    @EntityGraph(attributePaths = {"category", "items"})
    @Query("SELECT p FROM Product p WHERE " +
           "(cast(:keyword as string) IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', cast(:keyword as string), '%'))) AND " +
           "(cast(:categorySlug as string) IS NULL OR p.category.slug = cast(:categorySlug as string))")
    Page<Product> searchProducts(@Param("keyword") String keyword,
                                 @Param("categorySlug") String categorySlug,
                                 Pageable pageable);
}
