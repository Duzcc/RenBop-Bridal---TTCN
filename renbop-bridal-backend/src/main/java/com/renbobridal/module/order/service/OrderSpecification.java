package com.renbobridal.module.order.service;

import com.renbobridal.module.order.entity.Order;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

/**
 * JPA Specification builder cho dynamic query đơn hàng.
 * Cho phép lọc theo: status, orderType, customerName/email, khoảng ngày tạo, khoảng tiền.
 */
public class OrderSpecification {

    private static final ZoneId VN_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    public static Specification<Order> buildFilter(
            Order.Status status,
            Order.OrderType orderType,
            String customerSearch,
            LocalDate from,
            LocalDate to) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Eager fetch để tránh N+1
            if (query.getResultType() != Long.class && query.getResultType() != long.class) {
                root.fetch("customer", JoinType.LEFT);
                root.fetch("items", JoinType.LEFT);
                query.distinct(true);
            }

            // ── Filter: trạng thái đơn hàng ──────────────────────────────────
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            // ── Filter: loại đơn hàng ─────────────────────────────────────────
            if (orderType != null) {
                predicates.add(cb.equal(root.get("orderType"), orderType));
            }

            // ── Filter: tên hoặc email khách hàng ────────────────────────────
            if (customerSearch != null && !customerSearch.isBlank()) {
                String pattern = "%" + customerSearch.trim().toLowerCase() + "%";
                Join<Object, Object> customer = root.join("customer", JoinType.LEFT);
                Predicate nameMatch  = cb.like(cb.lower(customer.get("fullName")), pattern);
                Predicate emailMatch = cb.like(cb.lower(customer.get("email")), pattern);
                predicates.add(cb.or(nameMatch, emailMatch));
            }

            // ── Filter: khoảng ngày tạo ────────────────────────────────────────
            if (from != null) {
                Instant fromInstant = from.atStartOfDay(VN_ZONE).toInstant();
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), fromInstant));
            }
            if (to != null) {
                // to là ngày kết thúc (inclusive), lấy đến hết ngày đó theo VN timezone
                Instant toInstant = to.plusDays(1).atStartOfDay(VN_ZONE).toInstant();
                predicates.add(cb.lessThan(root.get("createdAt"), toInstant));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
