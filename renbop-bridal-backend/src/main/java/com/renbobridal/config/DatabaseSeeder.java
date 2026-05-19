package com.renbobridal.config;

import com.renbobridal.module.auth.entity.User;
import com.renbobridal.module.auth.repository.UserRepository;
import com.renbobridal.module.category.entity.Category;
import com.renbobridal.module.category.repository.CategoryRepository;
import com.renbobridal.module.product.entity.Product;
import com.renbobridal.module.product.entity.ProductItem;
import com.renbobridal.module.product.repository.ProductItemRepository;
import com.renbobridal.module.product.repository.ProductRepository;
import com.renbobridal.module.order.entity.Order;
import com.renbobridal.module.order.entity.OrderItem;
import com.renbobridal.module.order.repository.OrderRepository;
import com.renbobridal.module.payment.entity.Payment;
import com.renbobridal.module.payment.repository.PaymentRepository;
import com.renbobridal.module.auth.entity.CustomerMeasurement;
import com.renbobridal.module.order.entity.TailoringOrder;
import com.renbobridal.module.order.entity.FittingSession;
import com.renbobridal.module.order.entity.Return;
import com.renbobridal.module.order.entity.Damage;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final ProductItemRepository productItemRepository;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final PasswordEncoder passwordEncoder;
    private final EntityManager em;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Đã xóa check count() để nạp thêm dữ liệu bổ sung
        log.info("[SEEDER] Bắt đầu bơm dữ liệu giả lập (Luxury Data) vào hệ thống...");
        String suffix = "-" + System.currentTimeMillis();

        // 1. Tạo Khách hàng VIP
        User customer1 = User.builder()
                .email("vip.khachhang1" + suffix + "@gmail.com").password(passwordEncoder.encode("123456"))
                .fullName("Nguyễn Trần Bảo Ngọc").phone("0981112233").role(User.Role.CUSTOMER).build();
        User customer2 = User.builder()
                .email("vip.khachhang2" + suffix + "@gmail.com").password(passwordEncoder.encode("123456"))
                .fullName("Phạm Hoàng Anh").phone("0909888777").role(User.Role.CUSTOMER).build();
        User customer3 = User.builder()
                .email("vip.khachhang3" + suffix + "@gmail.com").password(passwordEncoder.encode("123456"))
                .fullName("Lê Ngọc Hân").phone("0934555666").role(User.Role.CUSTOMER).build();
        User customer4 = User.builder()
                .email("vip.khachhang4" + suffix + "@gmail.com").password(passwordEncoder.encode("123456"))
                .fullName("Trần Minh Quân").phone("0912444555").role(User.Role.CUSTOMER).build();
        User customer5 = User.builder()
                .email("vip.khachhang5" + suffix + "@gmail.com").password(passwordEncoder.encode("123456"))
                .fullName("Vũ Mai Phương").phone("0977666333").role(User.Role.CUSTOMER).build();
        userRepository.saveAll(List.of(customer1, customer2, customer3, customer4, customer5));
        List<User> customers = List.of(customer1, customer2, customer3, customer4, customer5);

        // 2. Tạo Danh mục
        Category catVayCuoi = Category.builder().name("Váy Cưới Cao Cấp").slug("vay-cuoi-cao-cap" + suffix).description("Bộ sưu tập váy cưới hoàng gia nhập khẩu").build();
        Category catAoDai = Category.builder().name("Áo Dài Cưới").slug("ao-dai-cuoi" + suffix).description("Áo dài truyền thống & cách tân lụa tơ tằm").build();
        Category catVest = Category.builder().name("Vest Chú Rể").slug("vest-chu-re" + suffix).description("Vest nam cao cấp lịch lãm nhập khẩu Italy").build();
        categoryRepository.saveAll(List.of(catVayCuoi, catAoDai, catVest));

        // 3. Tạo Sản phẩm Luxury
        Product p1 = Product.builder().category(catVayCuoi).name("The Royal Crystal Gown").slug("royal-crystal-gown" + suffix).description("Váy đính 10.000 viên đá pha lê.").basePrice(new BigDecimal("85000000.00")).salePrice(new BigDecimal("80000000.00")).imageUrls("[\"https://images.unsplash.com/photo-1594552072238-164789503487?auto=format&fit=crop&w=800&q=80\"]").build();
        Product p2 = Product.builder().category(catVayCuoi).name("Princess A-Line Dream").slug("princess-aline-dream" + suffix).description("Váy xòe bồng công chúa lộng lẫy.").basePrice(new BigDecimal("45000000.00")).imageUrls("[\"https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80\"]").build();
        Product p3 = Product.builder().category(catAoDai).name("Áo Dài Lụa Cung Đình").slug("ao-dai-lua-cung-dinh" + suffix).description("Áo dài lụa tơ tằm thêu tay hoàng gia.").basePrice(new BigDecimal("15000000.00")).imageUrls("[\"https://images.unsplash.com/photo-1621213458639-66c3a164b73b?auto=format&fit=crop&w=800&q=80\"]").build();
        Product p4 = Product.builder().category(catVest).name("Classic Italian Tuxedo").slug("classic-italian-tuxedo" + suffix).description("Bộ Tuxedo đen cổ điển Italy.").basePrice(new BigDecimal("12000000.00")).imageUrls("[\"https://images.unsplash.com/photo-1593032465175-481ac7f401a0?auto=format&fit=crop&w=800&q=80\"]").build();
        productRepository.saveAll(List.of(p1, p2, p3, p4));

        // 4. Sinh mã Kho (SKU) thực tế
        ProductItem i1 = ProductItem.builder().product(p1).sku("RB-VCA-001" + suffix).size("S").color("Trắng Tinh Khôi").status(ProductItem.Status.AVAILABLE).build();
        ProductItem i2 = ProductItem.builder().product(p1).sku("RB-VCA-002" + suffix).size("M").color("Trắng Sứ").status(ProductItem.Status.AVAILABLE).build();
        ProductItem i3 = ProductItem.builder().product(p2).sku("RB-VCP-001" + suffix).size("M").color("Kem Ivory").status(ProductItem.Status.AVAILABLE).build();
        ProductItem i4 = ProductItem.builder().product(p3).sku("RB-AD-001" + suffix).size("M").color("Đỏ Rượu").status(ProductItem.Status.AVAILABLE).build();
        ProductItem i5 = ProductItem.builder().product(p4).sku("RB-VEST-001" + suffix).size("L").color("Đen Huyền Bí").status(ProductItem.Status.AVAILABLE).build();
        List<ProductItem> items = List.of(i1, i2, i3, i4, i5);
        productItemRepository.saveAll(items);

        // ==============================================
        // VÒNG LẶP BƠM DỮ LIỆU ĐỂ LẤP ĐẦY UI (100x)
        // ==============================================
        java.util.Random rand = new java.util.Random();
        Instant now = Instant.now();
        
        for (int j = 1; j <= 100; j++) {
            String loopSuffix = suffix + "-" + j;
            User cust = customers.get(rand.nextInt(customers.size()));
            ProductItem pItem = items.get(rand.nextInt(items.size()));
            
            Order.OrderType type = Order.OrderType.values()[rand.nextInt(Order.OrderType.values().length)];
            // Để cho Dashboard nhìn đẹp, hãy cho nhiều đơn COMPLETED và một số PENDING
            Order.Status status = Order.Status.COMPLETED;
            int r = rand.nextInt(10);
            if (r < 2) status = Order.Status.PENDING;
            else if (r < 4) status = Order.Status.IN_PROGRESS;
            else if (r == 9) status = Order.Status.CANCELLED;

            // Generate random date between now and 30 days ago, with higher probability for recent days
            int randomDaysAgo = rand.nextInt(30);
            if (rand.nextBoolean()) randomDaysAgo = rand.nextInt(7); // Bias towards last 7 days for charts
            Instant randomCreatedAt = now.minus(randomDaysAgo, ChronoUnit.DAYS).minus(rand.nextInt(24), ChronoUnit.HOURS);
            
            Order o1 = Order.builder()
                    .customer(cust).orderType(type).status(status).note("Order tự động " + j)
                    .totalAmount(pItem.getProduct().getBasePrice()).items(new ArrayList<>()).build();
            
            OrderItem oi1 = OrderItem.builder().order(o1).productItem(pItem).price(pItem.getProduct().getBasePrice())
                    .quantity(1).build();
                    
            if (type == Order.OrderType.RENTAL) {
                oi1.setRentalStartDate(LocalDate.now().minusDays(randomDaysAgo));
                oi1.setRentalEndDate(LocalDate.now().minusDays(randomDaysAgo).plusDays(5));
            }
            
            o1.getItems().add(oi1);
            orderRepository.save(o1);
            
            // Bypass JPA @CreatedDate
            em.createNativeQuery("UPDATE orders SET created_at = :d, updated_at = :d WHERE id = :id")
              .setParameter("d", randomCreatedAt)
              .setParameter("id", o1.getId())
              .executeUpdate();

            // Payment
            if (status != Order.Status.PENDING && status != Order.Status.CANCELLED) {
                Payment pay = Payment.builder().order(o1).amount(o1.getTotalAmount())
                        .paymentMethod(rand.nextBoolean() ? Payment.PaymentMethod.BANK_TRANSFER : Payment.PaymentMethod.CASH)
                        .status(Payment.Status.COMPLETED).transactionId("TXN-" + loopSuffix).build();
                paymentRepository.save(pay);
            }

            // Tailoring Order
            if (type == Order.OrderType.TAILORING) {
                CustomerMeasurement m1 = CustomerMeasurement.builder().user(cust).bust(new BigDecimal("88.5")).waist(new BigDecimal("62.0")).hip(new BigDecimal("92.0")).shoulder(new BigDecimal("38.0")).armLength(new BigDecimal("55.0")).build();
                em.persist(m1);

                TailoringOrder.Status tStatus = TailoringOrder.Status.values()[rand.nextInt(TailoringOrder.Status.values().length)];
                TailoringOrder t1 = TailoringOrder.builder().orderItem(oi1).measurement(m1).status(tStatus).notes("Tailoring " + j).expectedCompletionDate(LocalDate.now().plusDays(10 - randomDaysAgo)).build();
                em.persist(t1);

                // Fitting session - some upcoming, some past
                int daysShift = rand.nextInt(14) - 7; // -7 to +7 days from now
                Instant fittingDate = now.plus(daysShift, ChronoUnit.DAYS);
                FittingSession.Status fStatus = daysShift < 0 ? FittingSession.Status.COMPLETED : FittingSession.Status.SCHEDULED;
                
                FittingSession f1 = FittingSession.builder().tailoringOrder(t1).fittingDate(fittingDate).status(fStatus).notes("Lịch thử đồ " + j).build();
                em.persist(f1);
            }
        }

        // Force remove the block logic check just to let it run again for the new data if needed
        // (But actually we want it to run without skipping, so I will clear DB or just save without uniqueness conflict)
        log.info("[SEEDER] Dữ liệu Luxury (Toàn diện) đã được bơm thành công!");
    }
}
