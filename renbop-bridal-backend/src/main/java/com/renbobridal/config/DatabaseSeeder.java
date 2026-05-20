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
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Component
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

    public DatabaseSeeder(UserRepository userRepository,
                          CategoryRepository categoryRepository,
                          ProductRepository productRepository,
                          ProductItemRepository productItemRepository,
                          OrderRepository orderRepository,
                          PaymentRepository paymentRepository,
                          PasswordEncoder passwordEncoder,
                          EntityManager em) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.productItemRepository = productItemRepository;
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
        this.passwordEncoder = passwordEncoder;
        this.em = em;
    }
    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("[SEEDER] Bắt đầu bơm dữ liệu giả lập (Luxury Data) vào hệ thống...");
        String suffix = "-" + System.currentTimeMillis();

        // 1. Tạo Khách hàng VIP (mới mỗi lần chạy)
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

        // 2. Tạo Danh mục — slug CỐ ĐỊNH, dùng findOrCreate để không bao giờ bị duplicate
        Category catVayCuoi = categoryRepository.findBySlug("vay-cuoi-cao-cap")
                .orElseGet(() -> categoryRepository.save(
                        Category.builder().name("Váy Cưới Cao Cấp").slug("vay-cuoi-cao-cap")
                                .description("Bộ sưu tập váy cưới hoàng gia nhập khẩu").build()));
        Category catAoDai = categoryRepository.findBySlug("ao-dai-cuoi")
                .orElseGet(() -> categoryRepository.save(
                        Category.builder().name("Áo Dài Cưới").slug("ao-dai-cuoi")
                                .description("Áo dài truyền thống & cách tân lụa tơ tằm").build()));
        Category catVest = categoryRepository.findBySlug("vest-chu-re")
                .orElseGet(() -> categoryRepository.save(
                        Category.builder().name("Vest Chú Rể").slug("vest-chu-re")
                                .description("Vest nam cao cấp lịch lãm nhập khẩu Italy").build()));
        Category catPhuKien = categoryRepository.findBySlug("phu-kien-cuoi")
                .orElseGet(() -> categoryRepository.save(
                        Category.builder().name("Váy Nhẹ & Phù Dâu").slug("phu-kien-cuoi")
                                .description("Dòng váy cưới nhẹ đi bàn và váy phù dâu thanh lịch").build()));
        log.info("[SEEDER] Khoi tao danh muc thanh cong.");
        // 3. Tao San pham Luxury
        // 3.1. Nhóm 1-5TR (BỘ SƯU TẬP 1-5TR)
        Product p5 = createProduct(catPhuKien, "Váy Phù Dâu Voan Tơ", "vay-phu-dau-voan-to" + suffix,
                "Dáng váy xòe nhẹ nhàng từ chất liệu voan tơ Hàn Quốc thanh lịch.", new BigDecimal("1800000.00"), null,
                makeImageUrls(
                        "/images/a1.webp",
                        "/images/a2.webp",
                        "/images/a3.webp",
                        "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80"
                ));

        Product p6 = createProduct(catPhuKien, "Váy Cưới Đi Bàn Satin Silk", "vay-cuoi-di-ban-satin" + suffix,
                "Thiết kế tối giản quyến rũ cho cô dâu tiếp khách.", new BigDecimal("2900000.00"), null,
                makeImageUrls(
                        "/images/a4.webp",
                        "/images/a5.webp",
                        "https://images.unsplash.com/photo-1549417229-aa67d3263c09?auto=format&fit=crop&w=800&q=80"
                ));

        Product p7 = createProduct(catPhuKien, "Váy Cưới Ngắn Cúp Ngực", "vay-cuoi-ngan-cup-nguc" + suffix,
                "Phong cách trẻ trung cho tiệc cưới ngoài trời.", new BigDecimal("3500000.00"), null,
                makeImageUrls(
                        "/images/a6.webp",
                        "/images/a7.webp",
                        "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80"
                ));

        Product p8 = createProduct(catVest, "Suit Hàn Quốc Slimfit Grey", "suit-han-quoc-slimfit-grey" + suffix,
                "Vest cưới nam màu xám sáng trẻ trung phom ôm dáng.", new BigDecimal("3200000.00"), null,
                makeImageUrls(
                        "/images/a8.webp",
                        "/images/a9.webp",
                        "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80"
                ));

        Product p18 = createProduct(catVest, "Vest Chú Rể Cotton Basic", "vest-chu-re-cotton-basic" + suffix,
                "Vest chú rể đen cơ bản thoáng mát.", new BigDecimal("2500000.00"), null,
                makeImageUrls(
                        "/images/a10.webp",
                        "/images/a11.webp",
                        "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80"
                ));

        // 3.2. Nhóm 5-7TR (BỘ SƯU TẬP 5-7TR)
        Product p9 = createProduct(catVayCuoi, "Minimalist Satin Dress", "minimalist-satin-dress" + suffix,
                "Váy cưới dáng suông phong cách tối giản thanh lịch.", new BigDecimal("6800000.00"), new BigDecimal("6000000.00"),
                makeImageUrls(
                        "/images/a12.webp",
                        "/images/a13.webp",
                        "https://images.unsplash.com/photo-1518049362265-d5b2a6467637?auto=format&fit=crop&w=800&q=80"
                ));

        Product p10 = createProduct(catAoDai, "Áo Dài Cưới Gấm Đỏ Trơn", "ao-dai-cuoi-gam-do" + suffix,
                "Áo dài gấm dệt hoạ tiết hoa chìm.", new BigDecimal("5500000.00"), null,
                makeImageUrls(
                        "/images/a14.webp",
                        "/images/a15.webp",
                        "https://images.unsplash.com/photo-1621213458639-66c3a164b73b?auto=format&fit=crop&w=800&q=80"
                ));

        Product p11 = createProduct(catVest, "Slim Fit Navy Suit", "slim-fit-navy-suit" + suffix,
                "Vest nam xanh navy phom dáng slimfit trẻ trung.", new BigDecimal("5800000.00"), null,
                makeImageUrls(
                        "/images/a16.webp",
                        "/images/a17.webp",
                        "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80"
                ));

        Product p19 = createProduct(catVayCuoi, "Váy Cưới Trễ Vai Boho Gió", "vay-cuoi-tre-vai-boho" + suffix,
                "Phong cách phóng khoáng với chân váy ren bồng bềnh.", new BigDecimal("6500000.00"), null,
                makeImageUrls(
                        "/images/a18.webp",
                        "/images/a19.webp",
                        "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80"
                ));

        // 3.3. Nhóm 8-12TR (BỘ SƯU TẬP 8-12TR)
        Product p12 = createProduct(catVayCuoi, "Off-shoulder Mermaid Gown", "off-shoulder-mermaid" + suffix,
                "Váy cưới dáng đuôi cá quyến rũ trễ vai.", new BigDecimal("11500000.00"), new BigDecimal("10800000.00"),
                makeImageUrls(
                        "/images/a20.webp",
                        "/images/a1-1.webp",
                        "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80"
                ));

        Product p13 = createProduct(catAoDai, "Áo Dài Tơ Sen Thêu Hoa", "ao-dai-to-sen-theu" + suffix,
                "Áo dài may từ sợi tơ sen thân thiện môi trường.", new BigDecimal("9500000.00"), null,
                makeImageUrls(
                        "/images/a1-2.webp",
                        "/images/a2.webp",
                        "https://images.unsplash.com/photo-1621213458639-66c3a164b73b?auto=format&fit=crop&w=800&q=80"
                ));

        Product p15 = createProduct(catVest, "Grey Tweed Groom Vest", "grey-tweed-groom-vest" + suffix,
                "Suit chú rể vải tweed xám cổ điển.", new BigDecimal("8800000.00"), null,
                makeImageUrls(
                        "/images/a3.webp",
                        "/images/a4.webp",
                        "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80"
                ));

        Product p20 = createProduct(catVayCuoi, "Váy Cưới Chữ A Thêu Hoa 3D", "vay-cuoi-chu-a-theu-3d" + suffix,
                "Váy chữ A đính hoa nhí 3D nổi bật ngọt ngào.", new BigDecimal("10500000.00"), null,
                makeImageUrls(
                        "/images/a5.webp",
                        "/images/a6.webp",
                        "https://images.unsplash.com/photo-1549417229-aa67d3263c09?auto=format&fit=crop&w=800&q=80"
                ));

        Product p21 = createProduct(catVest, "Suit Chú Rể Xanh Royal Wool", "suit-chu-re-xanh-royal-wool" + suffix,
                "Suit nam len tự nhiên màu xanh hoàng gia.", new BigDecimal("11800000.00"), null,
                makeImageUrls(
                        "/images/a7.webp",
                        "/images/a8.webp",
                        "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80"
                ));

        // 3.4. Nhóm 12-30TR (BỘ SƯU TẬP 12-30TR)
        Product p3 = createProduct(catAoDai, "Áo Dài Lụa Cung Đình", "ao-dai-lua-cung-dinh" + suffix,
                "Áo dài lụa tơ tằm thêu tay hoàng gia.", new BigDecimal("15000000.00"), null,
                makeImageUrls(
                        "/images/a9.webp",
                        "/images/a10.webp",
                        "https://images.unsplash.com/photo-1621213458639-66c3a164b73b?auto=format&fit=crop&w=800&q=80"
                ));

        Product p4 = createProduct(catVest, "Classic Italian Tuxedo", "classic-italian-tuxedo" + suffix,
                "Bộ Tuxedo đen cổ điển Italy.", new BigDecimal("12000000.00"), null,
                makeImageUrls(
                        "/images/a11.webp",
                        "/images/a12.webp",
                        "https://images.unsplash.com/photo-1593032465175-481ac7f401a0?auto=format&fit=crop&w=800&q=80"
                ));

        Product p16 = createProduct(catVayCuoi, "French Lace Princess Gown", "french-lace-princess" + suffix,
                "Váy công chúa phối ren Pháp thủ công nhập khẩu.", new BigDecimal("24000000.00"), new BigDecimal("22000000.00"),
                makeImageUrls(
                        "/images/a13.webp",
                        "/images/a14.webp",
                        "/images/a15.webp",
                        "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80"
                ));

        Product p17 = createProduct(catAoDai, "Áo Dài Phượng Bào Hoàng Gia", "ao-dai-phuong-bao" + suffix,
                "Áo dài cưới thêu phượng bào nhung đỏ.", new BigDecimal("18500000.00"), null,
                makeImageUrls(
                        "/images/a16.webp",
                        "/images/a17.webp",
                        "https://images.unsplash.com/photo-1621213458639-66c3a164b73b?auto=format&fit=crop&w=800&q=80"
                ));

        Product p22 = createProduct(catVayCuoi, "Váy Cưới Satin Đuôi Cá Royal", "vay-cuoi-satin-duoi-ca-royal" + suffix,
                "Dáng váy đuôi cá ôm sát dệt từ lụa satin cao cấp Pháp.", new BigDecimal("2700000.00"), null,
                makeImageUrls(
                        "/images/a18.webp",
                        "/images/a19.webp",
                        "https://images.unsplash.com/photo-1594552072238-164789503487?auto=format&fit=crop&w=800&q=80"
                ));

        Product p23 = createProduct(catVest, "Bespoke Cashmere Double Breasted", "bespoke-cashmere-double-breasted" + suffix,
                "Suit chú rể cúc kép dệt từ sợi cashmere tự nhiên Italy.", new BigDecimal("19500000.00"), null,
                makeImageUrls(
                        "/images/a20.webp",
                        "/images/a1.webp",
                        "https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=800&q=80"
                ));

        // 3.5. Nhóm siêu sang (30TR+)
        Product p1 = createProduct(catVayCuoi, "The Royal Crystal Gown", "royal-crystal-gown" + suffix,
                "Váy đính 10.000 viên đá pha lê.", new BigDecimal("85000000.00"), new BigDecimal("80000000.00"),
                makeImageUrls(
                        "/images/a2.webp",
                        "/images/a3.webp",
                        "/images/a4.webp",
                        "https://images.unsplash.com/photo-1594552072238-164789503487?auto=format&fit=crop&w=800&q=80"
                ));

        Product p2 = createProduct(catVayCuoi, "Princess A-Line Dream", "princess-aline-dream" + suffix,
                "Váy xòe bồng công chúa lộng lẫy.", new BigDecimal("45000000.00"), null,
                makeImageUrls(
                        "/images/a5.webp",
                        "/images/a6.webp",
                        "/images/a7.webp",
                        "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80"
                ));

        Product p24 = createProduct(catVest, "Bespoke Luxury Italian Velvet Suit", "bespoke-luxury-velvet-suit" + suffix,
                "Bộ Suit nhung tơ tằm thượng hạng đính khuy xà cừ.", new BigDecimal("35000000.00"), null,
                makeImageUrls(
                        "/images/a8.webp",
                        "/images/a9.webp",
                        "https://images.unsplash.com/photo-1593032465175-481ac7f401a0?auto=format&fit=crop&w=800&q=80"
                ));

        Product p25 = createProduct(catAoDai, "Áo Dài Hoàng Cung Tơ Sen Dát Vàng", "ao-dai-dat-vang" + suffix,
                "Áo dài thêu tay chỉ dát vàng 24K thủ công truyền thống.", new BigDecimal("32000000.00"), null,
                makeImageUrls(
                        "/images/a10.webp",
                        "/images/a11.webp",
                        "https://images.unsplash.com/photo-1621213458639-66c3a164b73b?auto=format&fit=crop&w=800&q=80"
                ));

        List<Product> allProducts = List.of(p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p15, p16, p17, p18, p19, p20, p21, p22, p23, p24, p25);
        productRepository.saveAll(allProducts);

        // 4. Sinh mã Kho (SKU) thực tế cho tất cả sản phẩm
        List<ProductItem> items = new ArrayList<>();
        int itemIndex = 1;
        for (Product prod : allProducts) {
            items.add(ProductItem.builder().product(prod).sku("RB-" + itemIndex + "-S" + suffix).size("S").color("Tiêu Chuẩn").status(ProductItem.Status.AVAILABLE).build());
            items.add(ProductItem.builder().product(prod).sku("RB-" + itemIndex + "-M" + suffix).size("M").color("Tiêu Chuẩn").status(ProductItem.Status.AVAILABLE).build());
            items.add(ProductItem.builder().product(prod).sku("RB-" + itemIndex + "-L" + suffix).size("L").color("Tiêu Chuẩn").status(ProductItem.Status.AVAILABLE).build());
            itemIndex++;
        }
        productItemRepository.saveAll(items);

        // =================================================================
        // VÒNG LẶP TẠO ĐƠN HÀNG CHO NGÀY HÔM NAY (mỗi lần restart BE)
        // Mỗi ngày restart → tích lũy thêm ~20 đơn của ngày đó
        // Qua nhiều ngày → dashboard tự có data từng ngày liên tục
        // =================================================================
        java.util.Random rand = new java.util.Random();
        Instant now = Instant.now();
        LocalDate today = LocalDate.now();

        // Lấy đầu ngày hôm nay (UTC)
        Instant startOfToday = today.atStartOfDay().toInstant(ZoneOffset.UTC);
        long secondsInDay = 86400L; // 24 * 60 * 60

        for (int j = 1; j <= 20; j++) {
            String loopSuffix = suffix + "-" + j;
            User cust = customers.get(rand.nextInt(customers.size()));
            ProductItem pItem = items.get(rand.nextInt(items.size()));

            Order.OrderType type = Order.OrderType.values()[rand.nextInt(Order.OrderType.values().length)];
            Order.Status status = Order.Status.COMPLETED;
            int r = rand.nextInt(10);
            if (r < 2) status = Order.Status.PENDING;
            else if (r < 4) status = Order.Status.IN_PROGRESS;
            else if (r == 9) status = Order.Status.CANCELLED;

            // Trải ngẫu nhiên trong 24 giờ của ngày hôm nay
            Instant orderTime = startOfToday.plusSeconds(rand.nextLong(secondsInDay));

            Order o1 = Order.builder()
                    .customer(cust).orderType(type).status(status)
                    .note("Đơn hàng ngày " + today + " #" + j)
                    .totalAmount(pItem.getProduct().getBasePrice()).items(new ArrayList<>()).build();

            OrderItem oi1 = OrderItem.builder().order(o1).productItem(pItem)
                    .price(pItem.getProduct().getBasePrice()).quantity(1).build();

            if (type == Order.OrderType.RENTAL) {
                oi1.setRentalStartDate(today);
                oi1.setRentalEndDate(today.plusDays(5));
            }

            o1.getItems().add(oi1);
            orderRepository.save(o1);

            // Ghi đè created_at = ngày hôm nay (bypass @CreatedDate)
            em.createNativeQuery("UPDATE orders SET created_at = :d, updated_at = :d WHERE id = :id")
              .setParameter("d", orderTime)
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
                TailoringOrder t1 = TailoringOrder.builder().orderItem(oi1).measurement(m1).status(tStatus).notes("Tailoring " + j).expectedCompletionDate(today.plusDays(10)).build();
                em.persist(t1);

                int daysShift = rand.nextInt(14) - 7;
                Instant fittingDate = now.plus(daysShift, ChronoUnit.DAYS);
                FittingSession.Status fStatus = daysShift < 0 ? FittingSession.Status.COMPLETED : FittingSession.Status.SCHEDULED;
                FittingSession f1 = FittingSession.builder().tailoringOrder(t1).fittingDate(fittingDate)
                        .status(fStatus).notes("Lịch thử đồ " + today + " #" + j).build();
                em.persist(f1);
            }
        }

        log.info("[SEEDER] Đã bơm 20 đơn hàng mới cho ngày {} thành công!", today);
    }

    private Product createProduct(Category category, String name, String slug, String description, BigDecimal basePrice, BigDecimal salePrice, String imageUrls) {
        Product p = new Product();
        p.setCategory(category);
        p.setName(name);
        p.setSlug(slug);
        p.setDescription(description);
        p.setBasePrice(basePrice);
        if (salePrice != null) {
            p.setSalePrice(salePrice);
        }
        p.setImageUrls(imageUrls);
        return p;
    }

    private String makeImageUrls(String... urls) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < urls.length; i++) {
            sb.append("\"").append(urls[i]).append("\"");
            if (i < urls.length - 1) {
                sb.append(",");
            }
        }
        sb.append("]");
        return sb.toString();
    }
}
