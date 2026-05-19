package com.renbobridal.module.order.service;

import com.renbobridal.common.exception.AppException;
import com.renbobridal.common.exception.ErrorCode;
import com.renbobridal.module.auth.entity.User;
import com.renbobridal.module.auth.repository.UserRepository;
import com.renbobridal.module.order.dto.FittingSessionRequest;
import com.renbobridal.module.order.dto.TailoringOrderDto.FittingSessionDto;
import com.renbobridal.module.order.entity.FittingSession;
import com.renbobridal.module.order.entity.Order;
import com.renbobridal.module.order.entity.OrderItem;
import com.renbobridal.module.order.entity.TailoringOrder;
import com.renbobridal.module.order.repository.FittingSessionRepository;
import com.renbobridal.module.order.repository.TailoringOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FittingSessionService {

    private final FittingSessionRepository fittingSessionRepository;
    private final TailoringOrderRepository tailoringOrderRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<FittingSessionDto> getAllFittingSessions() {
        return fittingSessionRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FittingSessionDto> getFittingSessionsByTailoringOrderId(Long tailoringOrderId) {
        if (!tailoringOrderRepository.existsById(tailoringOrderId)) {
            throw new AppException(ErrorCode.TAILORING_ORDER_NOT_FOUND);
        }
        return fittingSessionRepository.findByTailoringOrderId(tailoringOrderId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public FittingSessionDto createFittingSession(Long tailoringOrderId, FittingSessionRequest request, Long staffId) {
        TailoringOrder tailoringOrder = tailoringOrderRepository.findById(tailoringOrderId)
                .orElseThrow(() -> new AppException(ErrorCode.TAILORING_ORDER_NOT_FOUND));

        User staff = null;
        if (staffId != null) {
            staff = userRepository.findById(staffId)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        }

        FittingSession.Status status = FittingSession.Status.SCHEDULED;
        if (request.getStatus() != null) {
            try {
                status = FittingSession.Status.valueOf(request.getStatus().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new AppException(ErrorCode.INVALID_ORDER_STATUS);
            }
        }

        FittingSession session = FittingSession.builder()
                .tailoringOrder(tailoringOrder)
                .staff(staff)
                .fittingDate(request.getFittingDate())
                .notes(request.getNotes())
                .status(status)
                .build();

        return mapToDto(fittingSessionRepository.save(session));
    }

    @Transactional
    public FittingSessionDto updateFittingSession(Long id, FittingSessionRequest request, Long staffId) {
        FittingSession session = fittingSessionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.FITTING_SESSION_NOT_FOUND));

        if (staffId != null && (session.getStaff() == null || !session.getStaff().getId().equals(staffId))) {
            User staff = userRepository.findById(staffId)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
            session.setStaff(staff);
        }

        if (request.getStatus() != null) {
            try {
                session.setStatus(FittingSession.Status.valueOf(request.getStatus().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new AppException(ErrorCode.INVALID_ORDER_STATUS);
            }
        }

        session.setFittingDate(request.getFittingDate());
        session.setNotes(request.getNotes());

        return mapToDto(fittingSessionRepository.save(session));
    }

    @Transactional
    public void deleteFittingSession(Long id) {
        FittingSession session = fittingSessionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.FITTING_SESSION_NOT_FOUND));
        fittingSessionRepository.delete(session);
    }

    private FittingSessionDto mapToDto(FittingSession entity) {
        TailoringOrder to = entity.getTailoringOrder();
        OrderItem oi = (to != null) ? to.getOrderItem() : null;
        Order ord = (oi != null) ? oi.getOrder() : null;

        String customerName = null;
        if (ord != null && ord.getCustomer() != null) customerName = ord.getCustomer().getFullName();

        String productName = null;
        if (oi != null && oi.getProductItem() != null && oi.getProductItem().getProduct() != null) {
            productName = oi.getProductItem().getProduct().getName();
        }

        return FittingSessionDto.builder()
                .id(entity.getId())
                .tailoringOrderId(to != null ? to.getId() : null)
                .orderId(ord != null ? ord.getId() : null)
                .staffId(entity.getStaff() != null ? entity.getStaff().getId() : null)
                .staffName(entity.getStaff() != null ? entity.getStaff().getFullName() : null)
                .fittingDate(entity.getFittingDate() != null ? entity.getFittingDate().toString() : null)
                .status(entity.getStatus().name())
                .notes(entity.getNotes())
                .customerName(customerName)
                .productName(productName)
                .build();
    }
}
