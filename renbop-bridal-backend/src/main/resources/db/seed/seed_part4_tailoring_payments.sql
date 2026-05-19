-- Part 4: Tailoring Orders, Fitting Sessions, Payments, Returns, Damages

-- TAILORING ORDERS (dành cho các order items là may đo: ID từ 35 đến 54)
INSERT INTO tailoring_orders (id, order_item_id, status, notes, expected_completion_date) VALUES
(1,  35, 'DONE',       'Đã hoàn thành may áo dài đỏ', '2026-01-20'),
(2,  36, 'DONE',       'Hoàn thành áo dài xanh ngọc', '2026-02-05'),
(3,  37, 'DONE',       'Hoàn thành Princess A-Line', '2026-02-25'),
(4,  38, 'DONE',       'Hoàn thành Mermaid Gown', '2026-03-10'),
(5,  39, 'DONE',       'Hoàn thành Royal Crystal Gown', '2026-04-05'),
(6,  40, 'DONE',       'Hoàn thành Ivory Three-Piece Suit', '2026-03-30'),
(7,  41, 'DONE',       'Hoàn thành áo dài đỏ', '2026-04-15'),
(8,  42, 'DONE',       'Hoàn thành Off-Shoulder Lace', '2026-05-05'),
(9,  43, 'DONE',       'Hoàn thành áo dài xanh', '2026-05-10'),
(10, 44, 'FITTING',    'Đang thử dáng váy Royal Crystal', '2026-05-05'),
(11, 45, 'SEWING',     'Đang may váy Mermaid hiện đại', '2026-05-08'),
(12, 46, 'SEWING',     'Đang may áo dài đỏ 2026', '2026-05-10'),
(13, 47, 'CUTTING',    'Đang cắt vải Princess A-Line', '2026-05-12'),
(14, 48, 'MEASURED',   'Đã lấy số đo Off-Shoulder vintage', '2026-05-15'),
(15, 49, 'MEASURED',   'Đã lấy số đo Royal Crystal đặc biệt', '2026-05-17'),
(16, 50, 'MEASURED',   'Đã lấy số đo áo dài xanh custom', '2026-05-20'),
(17, 51, 'MEASURED',   'Đã hẹn lịch đo Mermaid Châu Âu', '2026-05-24'),
(18, 52, 'MEASURED',   'Đã hẹn lịch đo Royal Crystal', '2026-05-30'),
(19, 53, 'MEASURED',   'Đã lấy số đo áo dài đỏ lễ ăn hỏi', '2026-06-03'),
(20, 54, 'MEASURED',   'Đã hẹn lịch đo Mermaid ren', '2026-06-10');

SELECT setval('tailoring_orders_id_seq', 20);

-- FITTING SESSIONS (Các lịch thử đồ)
INSERT INTO fitting_sessions (id, tailoring_order_id, staff_id, fitting_date, status, notes) VALUES
(1,  1, 2, '2026-01-15 14:00:00+07', 'COMPLETED', 'Thử lần 1: Vừa vặn, không cần chỉnh sửa'),
(2,  2, 3, '2026-02-01 10:00:00+07', 'COMPLETED', 'Thử lần 1: Bóp eo thêm 2cm'),
(3,  3, 4, '2026-02-20 09:30:00+07', 'COMPLETED', 'Thử váy Princess, cúp ngực ôm sát'),
(4,  4, 2, '2026-03-05 15:00:00+07', 'COMPLETED', 'Thử Mermaid Gown, chỉnh đuôi váy'),
(5,  5, 3, '2026-03-25 11:00:00+07', 'COMPLETED', 'Thử lần 1 váy Royal Crystal, rất ưng ý'),
(6,  6, 4, '2026-03-28 14:00:00+07', 'COMPLETED', 'Thử suit chú rể, quần hơi dài, đã cắt bớt 1cm'),
(7,  7, 2, '2026-04-10 09:00:00+07', 'COMPLETED', 'Thử áo dài đỏ form riêng'),
(8,  8, 3, '2026-04-25 16:00:00+07', 'COMPLETED', 'Thử váy vintage, ren cổ rất đẹp'),
(9,  9, 4, '2026-05-02 10:30:00+07', 'COMPLETED', 'Thử áo dài xanh ngọc, vừa người'),
(10, 10, 2, '2026-05-20 14:00:00+07', 'SCHEDULED', 'Lịch thử dáng váy Royal Crystal (tương lai gần)'),
(11, 11, 3, '2026-05-25 09:00:00+07', 'SCHEDULED', 'Lịch thử Mermaid hiện đại'),
(12, 12, 4, '2026-05-26 15:00:00+07', 'SCHEDULED', 'Lịch thử áo dài đỏ 2026'),
(13, 14, 2, '2026-06-05 10:00:00+07', 'SCHEDULED', 'Lịch thử Off-Shoulder vintage lần 1'),
(14, 15, 3, '2026-06-15 14:00:00+07', 'SCHEDULED', 'Lịch thử Royal Crystal đặc biệt lần 1');

SELECT setval('fitting_sessions_id_seq', 14);

-- PAYMENTS (Thanh toán cho các Order 1->54)
INSERT INTO payments (id, order_id, payment_method, status, amount, transaction_id, created_at) VALUES
-- Tháng 1
(1,  1,  'CREDIT_CARD',  'COMPLETED', 45000000, 'TXN_20260103_001', '2026-01-03 10:00:00+07'),
(2,  2,  'BANK_TRANSFER','COMPLETED', 28000000, 'TXN_20260107_002', '2026-01-07 10:30:00+07'),
(3,  3,  'CASH',         'COMPLETED', 62000000, 'TXN_20260112_003', '2026-01-12 15:30:00+07'),
(4,  4,  'CREDIT_CARD',  'COMPLETED', 18000000, 'TXN_20260115_004', '2026-01-15 09:15:00+07'),
(5,  5,  'BANK_TRANSFER','COMPLETED', 85000000, 'TXN_20260118_005', '2026-01-18 13:45:00+07'),
(6,  6,  'CASH',         'COMPLETED', 22000000, 'TXN_20260122_006', '2026-01-22 09:30:00+07'),
(7,  7,  'CREDIT_CARD',  'COMPLETED', 15000000, 'TXN_20260125_007', '2026-01-25 11:15:00+07'),
-- Tháng 2
(8,  8,  'BANK_TRANSFER','COMPLETED', 45000000, 'TXN_20260201_008', '2026-02-01 09:30:00+07'),
(9,  9,  'CREDIT_CARD',  'COMPLETED', 72000000, 'TXN_20260205_009', '2026-02-05 14:15:00+07'),
(10, 10, 'CASH',         'COMPLETED', 18000000, 'TXN_20260210_010', '2026-02-10 10:20:00+07'),
(11, 11, 'CREDIT_CARD',  'COMPLETED', 12000000, 'TXN_20260212_011', '2026-02-12 09:30:00+07'),
(12, 12, 'BANK_TRANSFER','COMPLETED', 62000000, 'TXN_20260218_012', '2026-02-18 09:45:00+07'),
(13, 13, 'CASH',         'COMPLETED', 38000000, 'TXN_20260220_013', '2026-02-20 11:30:00+07'),
(14, 14, 'CREDIT_CARD',  'COMPLETED', 8500000,  'TXN_20260225_014', '2026-02-25 14:15:00+07'),
-- Tháng 3
(15, 15, 'BANK_TRANSFER','COMPLETED', 85000000, 'TXN_20260301_015', '2026-03-01 09:30:00+07'),
(16, 16, 'CREDIT_CARD',  'COMPLETED', 52000000, 'TXN_20260305_016', '2026-03-05 10:20:00+07'),
(17, 17, 'CASH',         'COMPLETED', 28000000, 'TXN_20260308_017', '2026-03-08 11:30:00+07'),
(18, 18, 'CREDIT_CARD',  'COMPLETED', 20000000, 'TXN_20260310_018', '2026-03-10 09:20:00+07'),
(19, 19, 'BANK_TRANSFER','COMPLETED', 45000000, 'TXN_20260315_019', '2026-03-15 14:30:00+07'),
(20, 20, 'CASH',         'COMPLETED', 22000000, 'TXN_20260318_020', '2026-03-18 09:45:00+07'),
(21, 21, 'CREDIT_CARD',  'COMPLETED', 72000000, 'TXN_20260320_021', '2026-03-20 11:15:00+07'),
(22, 22, 'BANK_TRANSFER','COMPLETED', 62000000, 'TXN_20260322_022', '2026-03-22 10:20:00+07'),
(23, 23, 'CASH',         'COMPLETED', 28000000, 'TXN_20260325_023', '2026-03-25 09:30:00+07'),
-- Tháng 4
(24, 24, 'CREDIT_CARD',  'COMPLETED', 85000000, 'TXN_20260401_024', '2026-04-01 09:15:00+07'),
(25, 25, 'BANK_TRANSFER','COMPLETED', 52000000, 'TXN_20260405_025', '2026-04-05 10:30:00+07'),
(26, 26, 'CASH',         'COMPLETED', 38000000, 'TXN_20260408_026', '2026-04-08 11:20:00+07'),
(27, 27, 'CREDIT_CARD',  'COMPLETED', 22000000, 'TXN_20260410_027', '2026-04-10 09:30:00+07'),
(28, 28, 'BANK_TRANSFER','COMPLETED', 12000000, 'TXN_20260412_028', '2026-04-12 10:15:00+07'),
(29, 29, 'CASH',         'COMPLETED', 22000000, 'TXN_20260415_029', '2026-04-15 09:40:00+07'),
(30, 30, 'CREDIT_CARD',  'COMPLETED', 45000000, 'TXN_20260418_030', '2026-04-18 11:20:00+07'),
(31, 31, 'BANK_TRANSFER','COMPLETED', 7500000,  'TXN_20260420_031', '2026-04-20 09:30:00+07'),
(32, 32, 'CASH',         'COMPLETED', 42500000, 'TXN_20260422_032_DEP', '2026-04-22 10:20:00+07'), -- Cọc 50%
(33, 33, 'CREDIT_CARD',  'COMPLETED', 18000000, 'TXN_20260425_033', '2026-04-25 09:15:00+07'),
-- Tháng 5 (Hiện tại)
(34, 34, 'BANK_TRANSFER','COMPLETED', 31000000, 'TXN_20260502_034_DEP', '2026-05-02 09:20:00+07'), -- Cọc 50%
(35, 35, 'CREDIT_CARD',  'COMPLETED', 42500000, 'TXN_20260505_035_DEP', '2026-05-05 10:30:00+07'), -- Cọc 50%
(36, 36, 'CASH',         'COMPLETED', 14000000, 'TXN_20260507_036_DEP', '2026-05-07 11:15:00+07'), -- Cọc 50%
(37, 37, 'BANK_TRANSFER','PENDING',   45000000, NULL,               '2026-05-10 09:00:00+07'),
(38, 38, 'CREDIT_CARD',  'COMPLETED', 20000000, 'TXN_20260512_038', '2026-05-12 10:15:00+07'),
(39, 39, 'BANK_TRANSFER','COMPLETED', 22500000, 'TXN_20260514_039_DEP', '2026-05-14 09:30:00+07'), -- Cọc 50%
(40, 40, 'CASH',         'PENDING',   72000000, NULL,               '2026-05-15 11:00:00+07'),
(41, 41, 'CREDIT_CARD',  'PENDING',   62000000, NULL,               '2026-05-16 09:00:00+07'),
(42, 42, 'BANK_TRANSFER','PENDING',   26000000, NULL,               '2026-05-17 10:00:00+07'),
(43, 43, 'CASH',         'PENDING',   38000000, NULL,               '2026-05-18 09:00:00+07'),
(44, 44, 'CREDIT_CARD',  'PENDING',   42500000, NULL,               '2026-05-19 10:00:00+07'),
-- Tháng 6, 7, 8 (Các đơn hàng đã cọc trước)
(45, 45, 'BANK_TRANSFER','COMPLETED', 42500000, 'TXN_20260520_045_DEP', '2026-05-20 09:15:00+07'), -- Cọc 50%
(46, 46, 'CASH',         'COMPLETED', 11000000, 'TXN_20260522_046_DEP', '2026-05-22 10:20:00+07'), -- Cọc 50%
(47, 47, 'CREDIT_CARD',  'COMPLETED', 22500000, 'TXN_20260525_047_DEP', '2026-05-25 09:45:00+07'), -- Cọc 50%
(48, 48, 'BANK_TRANSFER','COMPLETED', 31000000, 'TXN_20260526_048_DEP', '2026-05-26 10:30:00+07'), -- Cọc 50%
(49, 49, 'CASH',         'PENDING',   26000000, NULL,               '2026-05-28 09:00:00+07'),
(50, 50, 'CREDIT_CARD',  'COMPLETED', 42500000, 'TXN_20260601_050_DEP', '2026-06-01 09:20:00+07'), -- Cọc 50%
(51, 51, 'BANK_TRANSFER','PENDING',   36000000, NULL,               '2026-06-03 10:00:00+07'),
(52, 52, 'CASH',         'PENDING',   14000000, NULL,               '2026-06-05 09:00:00+07'),
(53, 53, 'CREDIT_CARD',  'PENDING',   42500000, NULL,               '2026-06-10 09:00:00+07'),
(54, 54, 'BANK_TRANSFER','PENDING',   31000000, NULL,               '2026-06-15 10:00:00+07');

SELECT setval('payments_id_seq', 54);

-- RETURNS (Lịch sử trả đồ cho các đơn RENTAL đã COMPLETED - order_id: 1, 3, 5, 7, 9, 10, 13, 16, 17, 19, 21, 22, 24, 26, 27, 30, 33)
INSERT INTO returns (id, order_id, receiver_staff_id, return_date, status, late_fee, created_at) VALUES
(1,  1,  2, '2026-01-16 16:00:00+07', 'ON_TIME', 0, '2026-01-16 16:30:00+07'),
(2,  3,  3, '2026-02-01 10:00:00+07', 'LATE',    1000000, '2026-02-01 10:30:00+07'), -- Trễ hẹn
(3,  5,  4, '2026-02-01 15:00:00+07', 'ON_TIME', 0, '2026-02-01 15:30:00+07'),
(4,  7,  2, '2026-01-30 14:00:00+07', 'ON_TIME', 0, '2026-01-30 14:30:00+07'),
(5,  9,  3, '2026-02-15 17:00:00+07', 'ON_TIME', 0, '2026-02-15 17:30:00+07'),
(6,  10, 4, '2026-02-17 11:00:00+07', 'ON_TIME', 0, '2026-02-17 11:30:00+07'),
(7,  13, 2, '2026-02-28 16:00:00+07', 'ON_TIME', 0, '2026-02-28 16:30:00+07'),
(8,  16, 3, '2026-03-15 09:00:00+07', 'LATE',    500000,  '2026-03-15 09:30:00+07'), -- Trễ hẹn
(9,  17, 4, '2026-03-12 14:00:00+07', 'ON_TIME', 0, '2026-03-12 14:30:00+07'),
(10, 19, 2, '2026-03-24 10:00:00+07', 'ON_TIME', 0, '2026-03-24 10:30:00+07'),
(11, 21, 3, '2026-03-31 15:00:00+07', 'ON_TIME', 0, '2026-03-31 15:30:00+07'),
(12, 22, 4, '2026-03-30 11:00:00+07', 'ON_TIME', 0, '2026-03-30 11:30:00+07'),
(13, 24, 2, '2026-04-12 16:00:00+07', 'ON_TIME', 0, '2026-04-12 16:30:00+07'),
(14, 26, 3, '2026-04-18 14:00:00+07', 'ON_TIME', 0, '2026-04-18 14:30:00+07'),
(15, 27, 4, '2026-04-14 10:00:00+07', 'ON_TIME', 0, '2026-04-14 10:30:00+07'),
(16, 30, 2, '2026-04-27 15:00:00+07', 'ON_TIME', 0, '2026-04-27 15:30:00+07'),
(17, 33, 3, '2026-04-30 11:00:00+07', 'ON_TIME', 0, '2026-04-30 11:30:00+07');

SELECT setval('returns_id_seq', 17);

-- DAMAGES (Ghi nhận hư hỏng đồ cho một số lần trả - return_id: 2, 8, 14)
INSERT INTO damages (id, return_id, product_item_id, description, repair_cost, charged_to_customer) VALUES
(1, 2,  10, 'Lấm bẩn rượu vang phần đuôi váy, cần giặt hấp tẩy chuyên sâu', 500000, TRUE),
(2, 8,  19, 'Đứt nút cài lưng, rách nhẹ 2cm viền ren', 300000, TRUE),
(3, 14, 13, 'Bị móc vào cây làm tước sợi chỉ thân váy Boho', 200000, FALSE); -- Cửa hàng tự chịu

SELECT setval('damages_id_seq', 3);

SELECT 'Part 4 Done: Tailoring=' || (SELECT COUNT(*) FROM tailoring_orders) ||
       ', Fittings=' || (SELECT COUNT(*) FROM fitting_sessions) ||
       ', Payments=' || (SELECT COUNT(*) FROM payments) ||
       ', Returns=' || (SELECT COUNT(*) FROM returns) ||
       ', Damages=' || (SELECT COUNT(*) FROM damages) AS status;
