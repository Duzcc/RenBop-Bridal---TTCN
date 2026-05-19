-- ============================================================
-- RENBO BRIDAL — REALISTIC SEED DATA (Part 1)
-- Truncate all + Insert users & categories
-- Current date context: 2026-05-19
-- ============================================================

-- Step 1: Truncate all transactional tables (CASCADE handles FK)
TRUNCATE TABLE damages, returns, payments, fitting_sessions,
               tailoring_orders, order_items, orders,
               customer_measurements, product_items,
               products, categories, users
RESTART IDENTITY CASCADE;

-- ============================================================
-- USERS: 1 Admin + 3 Staff + 27 Customers
-- Password hash = same as original admin (Admin@123)
-- ============================================================
INSERT INTO users (id, email, password, full_name, phone, role, created_at, updated_at) VALUES
-- Admin & Staff
(1,  'admin@renbop.com',             '$2a$10$L88sFFfmyFpj78QbSUwrsOp41eU9AElyEt7PuRP8Tn6UF7pMyiuLK', 'Quản Trị Viên',        '0901000001', 'ADMIN',    '2025-09-01 08:00:00+07', '2025-09-01 08:00:00+07'),
(2,  'staff.linh@renbop.com',        '$2a$10$L88sFFfmyFpj78QbSUwrsOp41eU9AElyEt7PuRP8Tn6UF7pMyiuLK', 'Nguyễn Thị Linh',      '0901000002', 'STAFF',    '2025-09-05 08:00:00+07', '2025-09-05 08:00:00+07'),
(3,  'staff.hung@renbop.com',        '$2a$10$L88sFFfmyFpj78QbSUwrsOp41eU9AElyEt7PuRP8Tn6UF7pMyiuLK', 'Trần Minh Hùng',       '0901000003', 'STAFF',    '2025-09-05 08:00:00+07', '2025-09-05 08:00:00+07'),
(4,  'staff.mai@renbop.com',         '$2a$10$L88sFFfmyFpj78QbSUwrsOp41eU9AElyEt7PuRP8Tn6UF7pMyiuLK', 'Lê Thị Mai',           '0901000004', 'STAFF',    '2025-10-01 08:00:00+07', '2025-10-01 08:00:00+07'),
-- Customers (password = same hash)
(5,  'bao.ngoc.nguyen@gmail.com',    '$2a$10$n0ld/shfxv0kglQcx2gHUODyOVtcwLqClYW/3uud2sWpDHPiY4Xri', 'Nguyễn Bảo Ngọc',      '0912001001', 'CUSTOMER', '2025-11-10 10:00:00+07', '2025-11-10 10:00:00+07'),
(6,  'hoang.anh.pham@gmail.com',     '$2a$10$n0ld/shfxv0kglQcx2gHUODyOVtcwLqClYW/3uud2sWpDHPiY4Xri', 'Phạm Hoàng Anh',       '0912001002', 'CUSTOMER', '2025-11-15 09:30:00+07', '2025-11-15 09:30:00+07'),
(7,  'thanh.huyen.le@gmail.com',     '$2a$10$n0ld/shfxv0kglQcx2gHUODyOVtcwLqClYW/3uud2sWpDHPiY4Xri', 'Lê Thanh Huyền',       '0912001003', 'CUSTOMER', '2025-12-01 14:00:00+07', '2025-12-01 14:00:00+07'),
(8,  'minh.thu.tran@gmail.com',      '$2a$10$n0ld/shfxv0kglQcx2gHUODyOVtcwLqClYW/3uud2sWpDHPiY4Xri', 'Trần Minh Thu',        '0912001004', 'CUSTOMER', '2025-12-08 11:00:00+07', '2025-12-08 11:00:00+07'),
(9,  'kim.oanh.vo@gmail.com',        '$2a$10$n0ld/shfxv0kglQcx2gHUODyOVtcwLqClYW/3uud2sWpDHPiY4Xri', 'Võ Kim Oanh',          '0912001005', 'CUSTOMER', '2025-12-15 16:00:00+07', '2025-12-15 16:00:00+07'),
(10, 'quynh.nhu.dang@gmail.com',     '$2a$10$n0ld/shfxv0kglQcx2gHUODyOVtcwLqClYW/3uud2sWpDHPiY4Xri', 'Đặng Quỳnh Như',       '0912001006', 'CUSTOMER', '2026-01-03 09:00:00+07', '2026-01-03 09:00:00+07'),
(11, 'thu.ha.bui@gmail.com',         '$2a$10$n0ld/shfxv0kglQcx2gHUODyOVtcwLqClYW/3uud2sWpDHPiY4Xri', 'Bùi Thu Hà',           '0912001007', 'CUSTOMER', '2026-01-07 10:00:00+07', '2026-01-07 10:00:00+07'),
(12, 'ngoc.linh.truong@gmail.com',   '$2a$10$n0ld/shfxv0kglQcx2gHUODyOVtcwLqClYW/3uud2sWpDHPiY4Xri', 'Trương Ngọc Linh',     '0912001008', 'CUSTOMER', '2026-01-12 15:00:00+07', '2026-01-12 15:00:00+07'),
(13, 'phuong.thao.hoang@gmail.com',  '$2a$10$n0ld/shfxv0kglQcx2gHUODyOVtcwLqClYW/3uud2sWpDHPiY4Xri', 'Hoàng Phương Thảo',    '0912001009', 'CUSTOMER', '2026-01-18 13:00:00+07', '2026-01-18 13:00:00+07'),
(14, 'lan.anh.dinh@gmail.com',       '$2a$10$n0ld/shfxv0kglQcx2gHUODyOVtcwLqClYW/3uud2sWpDHPiY4Xri', 'Đinh Lan Anh',         '0912001010', 'CUSTOMER', '2026-01-22 09:00:00+07', '2026-01-22 09:00:00+07'),
(15, 'my.linh.nguyen@gmail.com',     '$2a$10$n0ld/shfxv0kglQcx2gHUODyOVtcwLqClYW/3uud2sWpDHPiY4Xri', 'Nguyễn Mỹ Linh',       '0912001011', 'CUSTOMER', '2026-01-28 11:00:00+07', '2026-01-28 11:00:00+07'),
(16, 'thu.trang.le@gmail.com',       '$2a$10$n0ld/shfxv0kglQcx2gHUODyOVtcwLqClYW/3uud2sWpDHPiY4Xri', 'Lê Thu Trang',         '0912001012', 'CUSTOMER', '2026-02-03 14:00:00+07', '2026-02-03 14:00:00+07'),
(17, 'bich.van.pham@gmail.com',      '$2a$10$n0ld/shfxv0kglQcx2gHUODyOVtcwLqClYW/3uud2sWpDHPiY4Xri', 'Phạm Bích Vân',        '0912001013', 'CUSTOMER', '2026-02-10 10:00:00+07', '2026-02-10 10:00:00+07'),
(18, 'hong.nhung.tran@gmail.com',    '$2a$10$n0ld/shfxv0kglQcx2gHUODyOVtcwLqClYW/3uud2sWpDHPiY4Xri', 'Trần Hồng Nhung',      '0912001014', 'CUSTOMER', '2026-02-18 09:00:00+07', '2026-02-18 09:00:00+07'),
(19, 'khanh.linh.vu@gmail.com',      '$2a$10$n0ld/shfxv0kglQcx2gHUODyOVtcwLqClYW/3uud2sWpDHPiY4Xri', 'Vũ Khánh Linh',        '0912001015', 'CUSTOMER', '2026-02-24 16:00:00+07', '2026-02-24 16:00:00+07'),
(20, 'tuyen.nhi.cao@gmail.com',      '$2a$10$n0ld/shfxv0kglQcx2gHUODyOVtcwLqClYW/3uud2sWpDHPiY4Xri', 'Cao Tuyền Nhi',        '0912001016', 'CUSTOMER', '2026-03-01 09:00:00+07', '2026-03-01 09:00:00+07'),
(21, 'yen.nhi.duong@gmail.com',      '$2a$10$n0ld/shfxv0kglQcx2gHUODyOVtcwLqClYW/3uud2sWpDHPiY4Xri', 'Dương Yến Nhi',        '0912001017', 'CUSTOMER', '2026-03-07 11:00:00+07', '2026-03-07 11:00:00+07'),
(22, 'thu.uyen.luu@gmail.com',       '$2a$10$n0ld/shfxv0kglQcx2gHUODyOVtcwLqClYW/3uud2sWpDHPiY4Xri', 'Lưu Thu Uyên',         '0912001018', 'CUSTOMER', '2026-03-14 14:00:00+07', '2026-03-14 14:00:00+07'),
(23, 'bao.chau.ngo@gmail.com',       '$2a$10$n0ld/shfxv0kglQcx2gHUODyOVtcwLqClYW/3uud2sWpDHPiY4Xri', 'Ngô Bảo Châu',         '0912001019', 'CUSTOMER', '2026-03-20 10:00:00+07', '2026-03-20 10:00:00+07'),
(24, 'phuong.lan.trinh@gmail.com',   '$2a$10$n0ld/shfxv0kglQcx2gHUODyOVtcwLqClYW/3uud2sWpDHPiY4Xri', 'Trịnh Phương Lan',     '0912001020', 'CUSTOMER', '2026-04-01 09:00:00+07', '2026-04-01 09:00:00+07'),
(25, 'quynh.anh.ha@gmail.com',       '$2a$10$n0ld/shfxv0kglQcx2gHUODyOVtcwLqClYW/3uud2sWpDHPiY4Xri', 'Hà Quỳnh Anh',         '0912001021', 'CUSTOMER', '2026-04-05 11:00:00+07', '2026-04-05 11:00:00+07'),
(26, 'thu.hang.phan@gmail.com',      '$2a$10$n0ld/shfxv0kglQcx2gHUODyOVtcwLqClYW/3uud2sWpDHPiY4Xri', 'Phan Thu Hằng',        '0912001022', 'CUSTOMER', '2026-04-10 15:00:00+07', '2026-04-10 15:00:00+07'),
(27, 'dieu.linh.mai@gmail.com',      '$2a$10$n0ld/shfxv0kglQcx2gHUODyOVtcwLqClYW/3uud2sWpDHPiY4Xri', 'Mai Diệu Linh',        '0912001023', 'CUSTOMER', '2026-04-15 09:00:00+07', '2026-04-15 09:00:00+07'),
(28, 'phuong.uyen.do@gmail.com',     '$2a$10$n0ld/shfxv0kglQcx2gHUODyOVtcwLqClYW/3uud2sWpDHPiY4Xri', 'Đỗ Phương Uyên',       '0912001024', 'CUSTOMER', '2026-04-20 10:00:00+07', '2026-04-20 10:00:00+07'),
(29, 'ngoc.han.ly@gmail.com',        '$2a$10$n0ld/shfxv0kglQcx2gHUODyOVtcwLqClYW/3uud2sWpDHPiY4Xri', 'Lý Ngọc Hân',          '0912001025', 'CUSTOMER', '2026-04-28 09:00:00+07', '2026-04-28 09:00:00+07'),
(30, 'xuan.mai.nguyen@gmail.com',    '$2a$10$n0ld/shfxv0kglQcx2gHUODyOVtcwLqClYW/3uud2sWpDHPiY4Xri', 'Nguyễn Xuân Mai',      '0912001026', 'CUSTOMER', '2026-05-02 14:00:00+07', '2026-05-02 14:00:00+07'),
(31, 'vduc31100@gmail.com',          '$2a$10$n0ld/shfxv0kglQcx2gHUODyOVtcwLqClYW/3uud2sWpDHPiY4Xri', 'Trần Văn Đức',         '0912001027', 'CUSTOMER', '2026-01-01 08:00:00+07', '2026-01-01 08:00:00+07');

SELECT setval('users_id_seq', 31);

-- ============================================================
-- CATEGORIES: 7 danh mục đa dạng
-- ============================================================
INSERT INTO categories (id, name, slug, description, created_at, updated_at) VALUES
(1, 'Váy Cưới Cao Cấp',        'vay-cuoi-cao-cap',       'Bộ sưu tập váy cưới cao cấp, thiết kế độc quyền từ chất liệu nhập khẩu', '2025-09-01 08:00:00+07', '2025-09-01 08:00:00+07'),
(2, 'Áo Dài Cưới',             'ao-dai-cuoi',             'Áo dài cưới truyền thống Việt Nam, thêu tay tinh xảo', '2025-09-01 08:00:00+07', '2025-09-01 08:00:00+07'),
(3, 'Vest & Suit Chú Rể',      'vest-suit-chu-re',        'Vest và bộ suits cao cấp dành cho chú rể, may đo và sẵn có', '2025-09-01 08:00:00+07', '2025-09-01 08:00:00+07'),
(4, 'Phụ Kiện Cô Dâu',         'phu-kien-co-dau',         'Vương miện, hoa tai, cài tóc và phụ kiện cô dâu cao cấp', '2025-09-01 08:00:00+07', '2025-09-01 08:00:00+07'),
(5, 'Váy Phù Dâu',             'vay-phu-dau',             'Váy dành cho phù dâu, thiết kế đồng bộ thanh lịch', '2025-09-01 08:00:00+07', '2025-09-01 08:00:00+07'),
(6, 'Đầm Dạ Hội',              'dam-da-hoi',              'Đầm dạ hội và trang phục dự tiệc sang trọng', '2025-09-01 08:00:00+07', '2025-09-01 08:00:00+07'),
(7, 'Trang Phục Truyền Thống', 'trang-phuc-truyen-thong', 'Áo dài truyền thống và trang phục lễ hội Việt Nam', '2025-09-01 08:00:00+07', '2025-09-01 08:00:00+07');

SELECT setval('categories_id_seq', 7);

SELECT 'Part 1 Done: Users=' || (SELECT COUNT(*) FROM users) ||
       ', Categories=' || (SELECT COUNT(*) FROM categories) AS status;
