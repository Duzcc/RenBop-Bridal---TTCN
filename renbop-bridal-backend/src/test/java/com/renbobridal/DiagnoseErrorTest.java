package com.renbobridal;

import com.renbobridal.module.order.service.OrderService;
import com.renbobridal.module.order.service.TailoringOrderService;
import com.renbobridal.module.order.service.FittingSessionService;
import com.renbobridal.module.order.service.ReturnService;
import com.renbobridal.module.payment.service.PaymentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;

@SpringBootTest
public class DiagnoseErrorTest {

    @Autowired private OrderService orderService;
    @Autowired private PaymentService paymentService;
    @Autowired private TailoringOrderService tailoringOrderService;
    @Autowired private FittingSessionService fittingSessionService;
    @Autowired private ReturnService returnService;

    @Test
    public void testAllAdminEndpoints() {
        System.out.println("====== BẮT ĐẦU QUÉT LỖI TOÀN DIỆN ======");

        try {
            orderService.getAllOrders(PageRequest.of(0, 200));
            System.out.println("[OK] OrderService.getAllOrders()");
        } catch (Exception e) {
            System.err.println("[ERROR] OrderService.getAllOrders() FAILED!");
            e.printStackTrace();
        }

        try {
            paymentService.getAllPaymentsAdmin();
            System.out.println("[OK] PaymentService.getAllPaymentsAdmin()");
        } catch (Exception e) {
            System.err.println("[ERROR] PaymentService.getAllPaymentsAdmin() FAILED!");
            e.printStackTrace();
        }

        try {
            tailoringOrderService.getAllTailoringOrders();
            System.out.println("[OK] TailoringOrderService.getAllTailoringOrders()");
        } catch (Exception e) {
            System.err.println("[ERROR] TailoringOrderService.getAllTailoringOrders() FAILED!");
            e.printStackTrace();
        }

        System.out.println("====== HOÀN TẤT QUÉT LỖI ======");
    }
}
