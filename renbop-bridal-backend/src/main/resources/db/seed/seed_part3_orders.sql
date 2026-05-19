-- Part 3: Orders + Order Items
-- Trải dài Jan 2026 → Aug 2026
-- order_type: RENTAL, TAILORING, PURCHASE
-- status: PENDING, IN_PROGRESS, COMPLETED, CANCELLED

INSERT INTO orders (id, customer_id, staff_id, order_type, status, total_amount, note, created_at, updated_at) VALUES
-- ========== THÁNG 1/2026 ==========
(1,  10, 2, 'RENTAL',    'COMPLETED', 45000000, 'Thuê váy cưới đám cưới ngày 15/01', '2026-01-03 09:30:00+07', '2026-01-16 10:00:00+07'),
(2,  11, 3, 'TAILORING', 'COMPLETED', 28000000, 'May áo dài cưới màu đỏ theo yêu cầu', '2026-01-07 10:00:00+07', '2026-01-28 15:00:00+07'),
(3,  12, 2, 'RENTAL',    'COMPLETED', 62000000, 'Thuê váy mermaid cho đám cưới cuối tháng', '2026-01-12 15:00:00+07', '2026-01-31 11:00:00+07'),
(4,  31, 2, 'PURCHASE',  'COMPLETED', 18000000, 'Mua áo dài trắng tinh khôi', '2026-01-15 09:00:00+07', '2026-01-15 11:30:00+07'),
(5,  13, 3, 'RENTAL',    'COMPLETED', 85000000, 'Thuê Royal Crystal Gown size M', '2026-01-18 13:00:00+07', '2026-02-02 09:00:00+07'),
(6,  14, 4, 'TAILORING', 'COMPLETED', 22000000, 'May áo dài xanh ngọc theo số đo riêng', '2026-01-22 09:00:00+07', '2026-02-10 10:00:00+07'),
(7,  10, 2, 'RENTAL',    'COMPLETED', 15000000, 'Thuê vest navy cho chú rể', '2026-01-25 11:00:00+07', '2026-01-30 16:00:00+07'),
-- ========== THÁNG 2/2026 ==========
(8,  15, 2, 'TAILORING', 'COMPLETED', 45000000, 'May váy cưới princess A-line theo yêu cầu cô dâu', '2026-02-01 09:00:00+07', '2026-03-01 10:00:00+07'),
(9,  16, 3, 'RENTAL',    'COMPLETED', 72000000, 'Thuê Classic Ballgown đám cưới 14/02 Valentine', '2026-02-05 14:00:00+07', '2026-02-16 10:00:00+07'),
(10, 17, 4, 'RENTAL',    'COMPLETED', 18000000, 'Thuê tuxedo đen cho chú rể', '2026-02-10 10:00:00+07', '2026-02-18 09:00:00+07'),
(11, 18, 2, 'PURCHASE',  'COMPLETED', 12000000, 'Mua vương miện pha lê hoàng gia', '2026-02-12 09:00:00+07', '2026-02-12 11:00:00+07'),
(12, 19, 3, 'TAILORING', 'COMPLETED', 62000000, 'May váy mermaid theo số đo chi tiết', '2026-02-18 09:00:00+07', '2026-03-18 15:00:00+07'),
(13, 20, 4, 'RENTAL',    'COMPLETED', 38000000, 'Thuê váy Bohemian Garden', '2026-02-20 11:00:00+07', '2026-02-28 10:00:00+07'),
(14, 11, 2, 'PURCHASE',  'COMPLETED', 8500000,  'Mua bộ phụ kiện cô dâu luxury', '2026-02-25 14:00:00+07', '2026-02-25 15:30:00+07'),
-- ========== THÁNG 3/2026 (mùa cưới cao điểm) ==========
(15, 21, 3, 'TAILORING', 'COMPLETED', 85000000, 'May váy Royal Crystal theo yêu cầu đặc biệt', '2026-03-01 09:00:00+07', '2026-04-10 10:00:00+07'),
(16, 22, 2, 'RENTAL',    'COMPLETED', 52000000, 'Thuê Off-Shoulder Lace size M', '2026-03-05 10:00:00+07', '2026-03-15 11:00:00+07'),
(17, 23, 4, 'RENTAL',    'COMPLETED', 28000000, 'Thuê áo dài đỏ cung đình size L', '2026-03-08 11:00:00+07', '2026-03-12 09:00:00+07'),
(18, 24, 3, 'TAILORING', 'COMPLETED', 20000000, 'May bộ suit 3 mảnh màu kem cho chú rể', '2026-03-10 09:00:00+07', '2026-04-05 10:00:00+07'),
(19, 12, 2, 'RENTAL',    'COMPLETED', 45000000, 'Thuê Princess A-Line Dream cho đám cưới 22/03', '2026-03-15 14:00:00+07', '2026-03-24 10:00:00+07'),
(20, 13, 3, 'PURCHASE',  'COMPLETED', 22000000, 'Mua slim fit navy làm bộ sưu tập cá nhân', '2026-03-18 09:00:00+07', '2026-03-18 12:00:00+07'),
(21, 25, 4, 'RENTAL',    'COMPLETED', 72000000, 'Thuê Classic Ballgown cho đám cưới cuối tháng', '2026-03-20 11:00:00+07', '2026-03-31 10:00:00+07'),
(22, 15, 2, 'RENTAL',    'COMPLETED', 62000000, 'Thuê Elegant Mermaid size S', '2026-03-22 10:00:00+07', '2026-03-30 09:00:00+07'),
(23, 5,  3, 'TAILORING', 'COMPLETED', 28000000, 'May áo dài đỏ theo form riêng', '2026-03-25 09:00:00+07', '2026-04-20 10:00:00+07'),
-- ========== THÁNG 4/2026 ==========
(24, 26, 4, 'RENTAL',    'COMPLETED', 85000000, 'Thuê Royal Crystal Gown S cho đám cưới 10/04', '2026-04-01 09:00:00+07', '2026-04-12 10:00:00+07'),
(25, 27, 2, 'TAILORING', 'COMPLETED', 52000000, 'May Off-Shoulder Lace theo thiết kế riêng', '2026-04-05 10:00:00+07', '2026-05-10 15:00:00+07'),
(26, 28, 3, 'RENTAL',    'COMPLETED', 38000000, 'Thuê váy Bohemian size M cho đám cưới ngoài trời', '2026-04-08 11:00:00+07', '2026-04-18 10:00:00+07'),
(27, 6,  4, 'RENTAL',    'COMPLETED', 22000000, 'Thuê áo dài xanh ngọc cho đám cưới truyền thống', '2026-04-10 09:00:00+07', '2026-04-14 10:00:00+07'),
(28, 7,  2, 'PURCHASE',  'COMPLETED', 12000000, 'Mua vương miện vàng 18k', '2026-04-12 10:00:00+07', '2026-04-12 12:30:00+07'),
(29, 29, 3, 'TAILORING', 'COMPLETED', 22000000, 'May áo dài cưới xanh ngọc theo số đo chi tiết', '2026-04-15 09:00:00+07', '2026-05-15 10:00:00+07'),
(30, 8,  4, 'RENTAL',    'COMPLETED', 45000000, 'Thuê Princess A-Line cho đám cưới 25/04', '2026-04-18 11:00:00+07', '2026-04-27 09:00:00+07'),
(31, 9,  2, 'PURCHASE',  'COMPLETED', 7500000,  'Mua váy phù dâu xanh lá cho 3 phù dâu', '2026-04-20 09:00:00+07', '2026-04-20 11:00:00+07'),
(32, 16, 3, 'TAILORING', 'IN_PROGRESS', 85000000, 'May Royal Crystal Gown theo bản thiết kế tùy chỉnh', '2026-04-22 10:00:00+07', '2026-05-10 10:00:00+07'),
(33, 14, 4, 'RENTAL',    'COMPLETED', 18000000, 'Thuê tuxedo đen size L cho chú rể', '2026-04-25 09:00:00+07', '2026-04-30 10:00:00+07'),
-- ========== THÁNG 5/2026 (hiện tại) ==========
(34, 30, 2, 'TAILORING', 'IN_PROGRESS', 62000000, 'May váy mermaid theo phong cách hiện đại', '2026-05-02 09:00:00+07', '2026-05-10 10:00:00+07'),
(35, 17, 3, 'RENTAL',    'IN_PROGRESS', 85000000, 'Thuê Royal Crystal Gown M cho đám cưới 28/05', '2026-05-05 10:00:00+07', '2026-05-05 10:00:00+07'),
(36, 18, 4, 'TAILORING', 'IN_PROGRESS', 28000000, 'May áo dài đỏ mới theo thiết kế 2026', '2026-05-07 11:00:00+07', '2026-05-12 09:00:00+07'),
(37, 19, 2, 'RENTAL',    'PENDING',    45000000, 'Thuê Princess A-Line cho đám cưới 30/05', '2026-05-10 09:00:00+07', '2026-05-10 09:00:00+07'),
(38, 20, 3, 'PURCHASE',  'COMPLETED',  20000000, 'Mua Ivory Three-Piece cho bộ sưu tập chú rể', '2026-05-12 10:00:00+07', '2026-05-12 14:00:00+07'),
(39, 21, 4, 'TAILORING', 'IN_PROGRESS', 45000000, 'May váy Princess A-Line, chỉnh theo số đo cô dâu', '2026-05-14 09:00:00+07', '2026-05-14 09:00:00+07'),
(40, 22, 2, 'RENTAL',    'PENDING',    72000000, 'Thuê Classic Ballgown cho đám cưới 08/06', '2026-05-15 11:00:00+07', '2026-05-15 11:00:00+07'),
(41, 5,  3, 'RENTAL',    'PENDING',    62000000, 'Thuê Elegant Mermaid cho đám cưới 12/06', '2026-05-16 09:00:00+07', '2026-05-16 09:00:00+07'),
(42, 23, 4, 'TAILORING', 'PENDING',    52000000, 'May Off-Shoulder Lace phiên bản vintage', '2026-05-17 10:00:00+07', '2026-05-17 10:00:00+07'),
(43, 6,  2, 'RENTAL',    'PENDING',    38000000, 'Thuê váy Bohemian cho đám cưới 20/06', '2026-05-18 09:00:00+07', '2026-05-18 09:00:00+07'),
(44, 24, 3, 'TAILORING', 'PENDING',    85000000, 'May Royal Crystal Gown đặc biệt đám cưới 20/07', '2026-05-19 10:00:00+07', '2026-05-19 10:00:00+07'),
-- ========== THÁNG 6/2026 (tương lai) ==========
(45, 25, 4, 'RENTAL',    'PENDING',    85000000, 'Thuê Royal Crystal Gown đám cưới 14/06', '2026-05-20 09:00:00+07', '2026-05-20 09:00:00+07'),
(46, 26, 2, 'TAILORING', 'PENDING',    22000000, 'May áo dài xanh ngọc custom size', '2026-05-22 10:00:00+07', '2026-05-22 10:00:00+07'),
(47, 7,  3, 'RENTAL',    'PENDING',    45000000, 'Thuê Princess A-Line đám cưới 28/06', '2026-05-25 09:00:00+07', '2026-05-25 09:00:00+07'),
(48, 8,  4, 'TAILORING', 'PENDING',    62000000, 'May váy mermaid theo phong cách Châu Âu', '2026-05-26 10:00:00+07', '2026-05-26 10:00:00+07'),
(49, 27, 2, 'RENTAL',    'PENDING',    52000000, 'Thuê Off-Shoulder Lace đám cưới 05/07', '2026-05-28 09:00:00+07', '2026-05-28 09:00:00+07'),
-- ========== THÁNG 7/2026 ==========
(50, 28, 3, 'TAILORING', 'PENDING',    85000000, 'May Royal Crystal Gown đám cưới 15/07', '2026-06-01 09:00:00+07', '2026-06-01 09:00:00+07'),
(51, 9,  4, 'RENTAL',    'PENDING',    72000000, 'Thuê Classic Ballgown đám cưới 20/07', '2026-06-03 10:00:00+07', '2026-06-03 10:00:00+07'),
(52, 29, 2, 'TAILORING', 'PENDING',    28000000, 'May áo dài đỏ tùy chỉnh cho lễ ăn hỏi', '2026-06-05 09:00:00+07', '2026-06-05 09:00:00+07'),
-- ========== THÁNG 8/2026 ==========
(53, 30, 3, 'RENTAL',    'PENDING',    85000000, 'Thuê Royal Crystal Gown đám cưới 10/08', '2026-06-10 09:00:00+07', '2026-06-10 09:00:00+07'),
(54, 10, 4, 'TAILORING', 'PENDING',    62000000, 'May váy mermaid ren toàn thân cho đám cưới 20/08', '2026-06-15 10:00:00+07', '2026-06-15 10:00:00+07');

SELECT setval('orders_id_seq', 54);

-- ORDER ITEMS (mỗi order có 1-2 items)
INSERT INTO order_items (id, order_id, product_item_id, price, rental_start_date, rental_end_date, notes, quantity) VALUES
-- RENTAL orders có start/end date
(1,  1,  6,  45000000, '2026-01-15', '2026-01-16', 'Thuê váy Princess M trắng', 1),
(2,  3,  10, 62000000, '2026-01-28', '2026-01-31', 'Thuê Elegant Mermaid M trắng', 1),
(3,  4,  27, 18000000, NULL, NULL, 'Mua áo dài trắng size S', 1),
(4,  5,  3,  85000000, '2026-01-30', '2026-02-01', 'Thuê Royal Crystal Gown L trắng ngà', 1),
(5,  7,  33, 15000000, '2026-01-28', '2026-01-30', 'Thuê Navy Slim Fit M', 1),
(6,  9,  16, 72000000, '2026-02-14', '2026-02-15', 'Thuê Classic Ballgown M trắng - Valentine', 1),
(7,  10, 30, 18000000, '2026-02-16', '2026-02-17', 'Thuê Tuxedo M đen', 1),
(8,  11, 40, 12000000, NULL, NULL, 'Mua vương miện bạch kim', 1),
(9,  13, 12, 38000000, '2026-02-26', '2026-02-28', 'Thuê Bohemian S kem', 1),
(10, 14, 42, 8500000,  NULL, NULL, 'Mua bộ phụ kiện luxury bạc', 1),
(11, 16, 19, 52000000, '2026-03-12', '2026-03-14', 'Thuê Off-Shoulder M trắng', 1),
(12, 17, 22, 28000000, '2026-03-10', '2026-03-12', 'Thuê áo dài đỏ M', 1),
(13, 19, 5,  45000000, '2026-03-22', '2026-03-24', 'Thuê Princess A-Line S trắng', 1),
(14, 20, 34, 22000000, NULL, NULL, 'Mua Navy Slim Fit L', 1),
(15, 21, 15, 72000000, '2026-03-28', '2026-03-31', 'Thuê Classic Ballgown S trắng', 1),
(16, 22, 9,  62000000, '2026-03-28', '2026-03-30', 'Thuê Elegant Mermaid S trắng', 1),
(17, 24, 1,  85000000, '2026-04-10', '2026-04-12', 'Thuê Royal Crystal Gown S trắng ngà', 1),
(18, 26, 13, 38000000, '2026-04-15', '2026-04-18', 'Thuê Bohemian M kem boho', 1),
(19, 27, 24, 22000000, '2026-04-12', '2026-04-14', 'Thuê áo dài xanh S', 1),
(20, 28, 41, 12000000, NULL, NULL, 'Mua vương miện vàng 18k', 1),
(21, 30, 7,  45000000, '2026-04-25', '2026-04-27', 'Thuê Princess A-Line L trắng', 1),
(22, 31, 47, 7500000,  NULL, NULL, 'Mua váy phù dâu xanh lá S x3', 3),
(23, 33, 31, 18000000, '2026-04-27', '2026-04-30', 'Thuê Tuxedo L đen', 1),
(24, 35, 2,  85000000, '2026-05-28', '2026-05-30', 'Thuê Royal Crystal M trắng ngà', 1),
(25, 37, 8,  45000000, '2026-05-30', '2026-06-01', 'Thuê Princess hồng phấn M', 1),
(26, 38, 36, 20000000, NULL, NULL, 'Mua Ivory Three-Piece M kem', 1),
(27, 40, 17, 72000000, '2026-06-08', '2026-06-10', 'Thuê Classic Ballgown L - đám cưới 08/06', 1),
(28, 41, 11, 62000000, '2026-06-12', '2026-06-14', 'Thuê Elegant Mermaid L trắng', 1),
(29, 43, 14, 38000000, '2026-06-20', '2026-06-22', 'Thuê Bohemian L kem boho', 1),
(30, 45, 4,  85000000, '2026-06-14', '2026-06-16', 'Thuê Royal Crystal M kem - 14/06', 1),
(31, 47, 5,  45000000, '2026-06-28', '2026-06-30', 'Thuê Princess S trắng', 1),
(32, 49, 18, 52000000, '2026-07-05', '2026-07-07', 'Thuê Off-Shoulder S trắng', 1),
(33, 51, 15, 72000000, '2026-07-20', '2026-07-22', 'Thuê Classic Ballgown S trắng', 1),
(34, 53, 2,  85000000, '2026-08-10', '2026-08-12', 'Thuê Royal Crystal M ngà - đám cưới 10/08', 1),
-- TAILORING orders (product_item_id NULL - may theo đo)
(35, 2,  NULL, 28000000, NULL, NULL, 'May áo dài đỏ cung đình theo số đo chị Bùi Thu Hà', 1),
(36, 6,  NULL, 22000000, NULL, NULL, 'May áo dài xanh ngọc theo số đo chị Đinh Lan Anh', 1),
(37, 8,  NULL, 45000000, NULL, NULL, 'May Princess A-Line theo thiết kế riêng chị Mỹ Linh', 1),
(38, 12, NULL, 62000000, NULL, NULL, 'May Elegant Mermaid theo số đo chi tiết chị Khánh Linh', 1),
(39, 15, NULL, 85000000, NULL, NULL, 'May Royal Crystal Gown custom cho chị Yến Nhi', 1),
(40, 18, NULL, 20000000, NULL, NULL, 'May Ivory Three-Piece suit cho chú rể Phương Lan', 1),
(41, 23, NULL, 28000000, NULL, NULL, 'May áo dài đỏ form riêng chị Bảo Ngọc', 1),
(42, 25, NULL, 52000000, NULL, NULL, 'May Off-Shoulder Lace vintage cho chị Diệu Linh', 1),
(43, 29, NULL, 22000000, NULL, NULL, 'May áo dài xanh theo số đo chị Ngọc Hân', 1),
(44, 32, NULL, 85000000, NULL, NULL, 'May Royal Crystal phiên bản custom chị Thu Trang', 1),
(45, 34, NULL, 62000000, NULL, NULL, 'May Elegant Mermaid hiện đại chị Xuân Mai', 1),
(46, 36, NULL, 28000000, NULL, NULL, 'May áo dài đỏ 2026 chị Hồng Nhung', 1),
(47, 39, NULL, 45000000, NULL, NULL, 'May Princess A-Line chỉnh form chị Yến Nhi', 1),
(48, 42, NULL, 52000000, NULL, NULL, 'May Off-Shoulder Lace vintage chị Bảo Châu', 1),
(49, 44, NULL, 85000000, NULL, NULL, 'May Royal Crystal đặc biệt cho đám cưới 20/07 chị Phương Lan', 1),
(50, 46, NULL, 22000000, NULL, NULL, 'May áo dài xanh custom chị Thu Hằng', 1),
(51, 48, NULL, 62000000, NULL, NULL, 'May Mermaid Châu Âu chị Minh Thu', 1),
(52, 50, NULL, 85000000, NULL, NULL, 'May Royal Crystal đám cưới 15/07 chị Phương Uyên', 1),
(53, 52, NULL, 28000000, NULL, NULL, 'May áo dài đỏ lễ ăn hỏi chị Ngọc Hân', 1),
(54, 54, NULL, 62000000, NULL, NULL, 'May Mermaid ren toàn thân đám cưới 20/08 chị Quỳnh Như', 1);

SELECT setval('order_items_id_seq', 54);

SELECT 'Part 3 Done: Orders=' || (SELECT COUNT(*) FROM orders) ||
       ', OrderItems=' || (SELECT COUNT(*) FROM order_items) AS status;
