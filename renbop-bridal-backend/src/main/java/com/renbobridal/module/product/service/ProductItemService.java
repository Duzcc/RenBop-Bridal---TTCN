package com.renbobridal.module.product.service;

import com.renbobridal.common.exception.AppException;
import com.renbobridal.common.exception.ErrorCode;
import com.renbobridal.module.product.dto.ProductDto.ProductItemDto;
import com.renbobridal.module.product.dto.ProductItemRequest;
import com.renbobridal.module.product.entity.Product;
import com.renbobridal.module.product.entity.ProductItem;
import com.renbobridal.module.product.repository.ProductItemRepository;
import com.renbobridal.module.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductItemService {

    private final ProductItemRepository productItemRepository;
    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public List<ProductItemDto> getItemsByProductId(Long productId) {
        return productItemRepository.findByProductId(productId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductItemDto getItemById(Long id) {
        return mapToDto(productItemRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND)));
    }

    @Transactional
    public ProductItemDto addProductItem(Long productId, ProductItemRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        if (productItemRepository.existsBySku(request.getSku())) {
            throw new AppException(ErrorCode.BAD_REQUEST); // TODO: Replace with SKU_ALREADY_EXISTS later
        }

        ProductItem.Status status = ProductItem.Status.AVAILABLE;
        if (request.getStatus() != null) {
            try {
                status = ProductItem.Status.valueOf(request.getStatus().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new AppException(ErrorCode.BAD_REQUEST);
            }
        }

        ProductItem item = ProductItem.builder()
                .product(product)
                .sku(request.getSku())
                .size(request.getSize())
                .color(request.getColor())
                .status(status)
                .build();

        return mapToDto(productItemRepository.save(item));
    }

    @Transactional
    public ProductItemDto updateProductItem(Long id, ProductItemRequest request) {
        ProductItem item = productItemRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        if (!item.getSku().equals(request.getSku()) && productItemRepository.existsBySku(request.getSku())) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }

        item.setSku(request.getSku());
        item.setSize(request.getSize());
        item.setColor(request.getColor());

        if (request.getStatus() != null) {
            try {
                item.setStatus(ProductItem.Status.valueOf(request.getStatus().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new AppException(ErrorCode.BAD_REQUEST);
            }
        }

        return mapToDto(productItemRepository.save(item));
    }

    @Transactional
    public void deleteProductItem(Long id) {
        ProductItem item = productItemRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        productItemRepository.delete(item);
    }

    public ProductItemDto mapToDto(ProductItem item) {
        return ProductItemDto.builder()
                .id(item.getId())
                .sku(item.getSku())
                .size(item.getSize())
                .color(item.getColor())
                .status(item.getStatus().name())
                .build();
    }
}
