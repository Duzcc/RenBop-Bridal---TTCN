package com.renbobridal.module.order.scheduler;

import com.renbobridal.module.order.entity.OrderItem;
import com.renbobridal.module.order.repository.OrderItemRepository;
import com.renbobridal.module.product.entity.ProductItem;
import com.renbobridal.module.product.repository.ProductItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderScheduler {

    private final OrderItemRepository orderItemRepository;
    private final ProductItemRepository productItemRepository;

    /**
     * Chạy tự động vào 00:00 (nửa đêm) mỗi ngày.
     * Quét các sản phẩm đang được thuê (RENTAL), nếu đã quá hạn ngày trả (rentalEndDate < ngày hôm nay),
     * tự động chuyển trạng thái của ProductItem sang MAINTENANCE (Bảo trì / Giặt ủi).
     */
    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void checkExpiredRentals() {
        log.info("[OrderScheduler] Bắt đầu quét các đơn Thuê quá hạn...");
        
        LocalDate today = LocalDate.now();
        List<OrderItem> expiredItems = orderItemRepository.findExpiredRentals(today);

        if (expiredItems.isEmpty()) {
            log.info("[OrderScheduler] Không có đơn Thuê nào cần xử lý.");
            return;
        }

        int updatedCount = 0;
        for (OrderItem item : expiredItems) {
            ProductItem productItem = item.getProductItem();
            if (productItem != null && productItem.getStatus() == ProductItem.Status.RENTED) {
                // Tự động chuyển qua trạng thái Bảo trì/Giặt
                productItem.setStatus(ProductItem.Status.MAINTENANCE);
                productItemRepository.save(productItem);
                updatedCount++;
                log.info("[OrderScheduler] Đã tự động đổi trạng thái SKU {} sang MAINTENANCE do quá hạn thuê.", productItem.getSku());
            }
        }

        log.info("[OrderScheduler] Quá trình hoàn tất. Đã cập nhật trạng thái {} mã SKU.", updatedCount);
    }
}
