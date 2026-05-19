package com.renbobridal.module.order.service;

import com.renbobridal.common.exception.AppException;
import com.renbobridal.common.exception.ErrorCode;
import com.renbobridal.module.order.dto.DamageRequest;
import com.renbobridal.module.order.dto.ReturnDto.DamageDto;
import com.renbobridal.module.order.entity.Damage;
import com.renbobridal.module.order.entity.Return;
import com.renbobridal.module.order.repository.DamageRepository;
import com.renbobridal.module.order.repository.ReturnRepository;
import com.renbobridal.module.product.entity.ProductItem;
import com.renbobridal.module.product.repository.ProductItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DamageService {

    private final DamageRepository damageRepository;
    private final ReturnRepository returnRepository;
    private final ProductItemRepository productItemRepository;

    @Transactional(readOnly = true)
    public List<DamageDto> getDamagesByReturnId(Long returnId) {
        if (!returnRepository.existsById(returnId)) {
            throw new AppException(ErrorCode.BAD_REQUEST);
        }
        return damageRepository.findByReturnRecordId(returnId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public DamageDto reportDamage(Long returnId, Long productItemId, DamageRequest request) {
        Return returnRecord = returnRepository.findById(returnId)
                .orElseThrow(() -> new AppException(ErrorCode.BAD_REQUEST));

        ProductItem productItem = productItemRepository.findById(productItemId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        // Create damage record
        Damage damage = Damage.builder()
                .returnRecord(returnRecord)
                .productItem(productItem)
                .description(request.getDescription())
                .repairCost(request.getRepairCost() != null ? request.getRepairCost() : BigDecimal.ZERO)
                .chargedToCustomer(request.getChargedToCustomer() != null ? request.getChargedToCustomer() : true)
                .build();

        // Automatically mark the product item as DAMAGED
        productItem.setStatus(ProductItem.Status.DAMAGED);
        productItemRepository.save(productItem);

        return mapToDto(damageRepository.save(damage));
    }

    @Transactional
    public void deleteDamage(Long id) {
        Damage damage = damageRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BAD_REQUEST));
        damageRepository.delete(damage);
    }

    private DamageDto mapToDto(Damage damage) {
        return DamageDto.builder()
                .id(damage.getId())
                .productItemId(damage.getProductItem().getId())
                .productSku(damage.getProductItem().getSku())
                .description(damage.getDescription())
                .repairCost(damage.getRepairCost())
                .chargedToCustomer(damage.getChargedToCustomer())
                .build();
    }
}
