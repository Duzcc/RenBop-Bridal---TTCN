# 👰‍♀️ Renbo Bridal - Nền tảng Quản lý Tiệm Váy Cưới Cao Cấp

Renbo Bridal là một hệ thống toàn diện dành cho việc quản lý và kinh doanh váy cưới cao cấp. Hệ thống được chia thành hai phần chính: **Frontend (React)** dành cho Khách hàng & Quản trị viên, và **Backend (Spring Boot)** xử lý nghiệp vụ, bảo mật, và cơ sở dữ liệu.

## 🛠 Tech Stack (Công nghệ sử dụng)
- **Frontend:** React 18, Vite, Tailwind CSS, Framer Motion, Lucide React, Recharts.
- **Backend:** Java 17, Spring Boot 3, Spring Security (JWT), Hibernate/JPA, Flyway (Database Migration).
- **Database & Cache:** PostgreSQL 16, Redis.
- **Hạ tầng & Bảo mật:** Docker, Gửi Email SMTP, Xác thực 2 Lớp (2FA), Block tài khoản khi nhập sai mật khẩu nhiều lần.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Dự Án

### 1. Yêu cầu hệ thống (Prerequisites)
Để chạy dự án, máy tính của bạn cần cài đặt sẵn:
- **Node.js** (v18 trở lên)
- **Java JDK 17** trở lên
- **Docker & Docker Compose** (để chạy Database và Redis nhanh chóng)
- Git (tuỳ chọn)

### 2. Cài đặt Docker (Dành cho người chạy mã nguồn trên máy cá nhân)
Để khởi tạo Database và Redis nhanh chóng nhất, bạn nên sử dụng Docker. Nếu chưa có Docker, hãy làm theo các bước sau:

**Dành cho Windows / macOS:**
1. Truy cập trang chủ Docker: [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
2. Tải bản **Docker Desktop** phù hợp với hệ điều hành của bạn.
3. Chạy file cài đặt (với Windows, hãy đảm bảo bạn đã bật tính năng WSL 2 theo hướng dẫn lúc cài đặt).
4. Mở ứng dụng Docker Desktop lên và chờ cho đến khi icon Docker (hình con cá voi) chuyển sang màu xanh lá báo hiệu Docker Engine đã chạy.
5. Mở Terminal / Command Prompt và gõ lệnh `docker -v` để kiểm tra. Nếu hiện ra phiên bản (ví dụ: `Docker version 24.x.x`) là bạn đã cài đặt thành công!

> **💡 Lời khuyên:** Cài đặt Docker là cách dễ nhất. Tuy nhiên, nếu máy tính của bạn không đủ cấu hình chạy Docker, bạn vẫn có thể cài đặt trực tiếp **PostgreSQL** (chạy ở port `5433`, tạo database `renbop_bridal`, user `renbop`, mật khẩu `password`) và **Redis** (chạy ở port `6379`) thủ công.

---

### 3. Khởi động Cở sở dữ liệu (PostgreSQL & Redis)

> **💡 Lưu ý:** Nếu bạn chỉ muốn dùng thử hệ thống mà người khác đã chạy sẵn, bạn **KHÔNG CẦN** cài đặt Docker hay chạy code. Chỉ cần kết nối cùng mạng Wi-Fi với máy chủ (máy chạy code) và truy cập vào địa chỉ IP của máy đó (ví dụ: `http://192.168.1.x:5173`).

Nếu bạn tự chạy code và đã có Docker, hãy mở Terminal, di chuyển vào thư mục backend và chạy:
```bash
cd renbop-bridal-backend
docker-compose up -d
```
Lệnh này sẽ khởi tạo 2 container:
- `renbop_postgres`: Chạy ở port `5433` (User: `renbop`, DB: `renbop_bridal`)
- `renbop_redis`: Chạy ở port `6379`

### 4. Cấu hình & Chạy Backend (Spring Boot)
Backend sử dụng file `.env` để bảo mật thông tin nhạy cảm (như tài khoản gửi mail). 
Đảm bảo bạn đã có file `.env` nằm ở thư mục gốc của backend (`renbop-bridal-backend/.env`) với nội dung như sau:
```env
# Email cấu hình để hệ thống tự động gửi mã OTP & Xác nhận đơn hàng
SMTP_USERNAME=vduc31100@gmail.com
SMTP_PASSWORD=mật_khẩu_ứng_dụng_của_bạn
```

Tiếp theo, chạy lệnh khởi động Backend:
```bash
./mvnw clean spring-boot:run
```
> **Lưu ý:** Trong lần chạy đầu tiên, **Flyway** sẽ tự động tạo bảng, và **DatabaseSeeder** sẽ tự động bơm hàng trăm dữ liệu mẫu (sản phẩm, đơn hàng, khách hàng VIP) vào hệ thống.
> Backend sẽ chạy tại: `http://localhost:8080`

### 5. Cấu hình & Chạy Frontend (React)
Mở một cửa sổ Terminal mới, di chuyển vào thư mục frontend:
```bash
cd ../renbop-bridal
```

Cài đặt các thư viện cần thiết:
```bash
npm install
```

Khởi động giao diện người dùng:
```bash
npm run dev
```
> Frontend sẽ chạy tại: `http://localhost:5173` (Vite tự động mở port này).

---

## 🔑 Tài Khoản Test (Seeder Data)

Sau khi hệ thống chạy lên, Database đã được nạp sẵn các tài khoản sau để bạn test:

**Tài khoản Quản Trị (Admin)**
- **Email:** `admin@renbop.com`
- **Mật khẩu:** `Admin2026!`
- **Bảo mật:** Đã bật 2FA. Mã OTP sẽ được gửi về email khai báo trong file `.env` (ví dụ: `vduc31100@gmail.com`).
- **Phân quyền:** Tự động điều hướng vào Dashboard Admin sau khi đăng nhập.

**Tài khoản Khách Hàng VIP (Customer)**
- **Email:** `vip.khachhang1...` đến `vip.khachhang5...` (Bạn có thể xem email chính xác trong Database bảng `users` hoặc tạo tài khoản mới ngay trên giao diện).
- **Mật khẩu mặc định:** `123456`

---

## 🌟 Tính Năng Nổi Bật

### Dành Cho Khách Hàng (Customer)
1. **Trải nghiệm mua sắm mượt mà:** Xem danh sách váy cưới, thêm vào giỏ hàng, đặt may đo riêng (Tailoring) hoặc thuê (Rental).
2. **Quản lý đơn hàng:** Theo dõi trạng thái đơn hàng (Đang xử lý, Đang may, Đã giao).
3. **Bảo mật cao cấp (Hồ sơ cá nhân):** 
   - Chủ động bật/tắt **Bảo mật 2 Lớp (2FA)**.
   - Quản lý phiên đăng nhập và đổi mật khẩu.

### Dành Cho Quản Trị Viên (Admin)
1. **Tổng quan (Dashboard):** Xem biểu đồ doanh thu theo thời gian thực (được tính toán từ hàng trăm đơn hàng fake).
2. **Quản lý nghiệp vụ cưới:**
   - Quản lý các hợp đồng May đo (Tailoring) & Số đo khách hàng.
   - Quản lý Lịch thử đồ (Fitting Sessions).
   - Quản lý Đổi/Trả đồ (Returns & Damages).
3. **Bảo mật Admin:** Yêu cầu xác thực 2 bước bằng OTP qua email mỗi khi đăng nhập. Khóa tài khoản 15 phút nếu nhập sai mật khẩu quá 5 lần.

---

## 🛠 Xử Lý Lỗi Thường Gặp (Troubleshooting)

- **Lỗi `ACCOUNT_LOCKED` khi đăng nhập:** Tài khoản sẽ bị khóa nếu nhập sai mật khẩu 5 lần. Để mở khóa ngay lập tức mà không cần chờ 15 phút, bạn có thể xóa cache trên Redis:
  ```bash
  docker exec renbop_redis redis-cli DEL "login_locked:admin@renbop.com"
  docker exec renbop_redis redis-cli DEL "login_attempts:admin@renbop.com"
  ```
- **Lỗi `401 Unauthorized` hoặc Crash màn hình khi nhập mã OTP:** Đảm bảo bạn đang chạy bản cập nhật mới nhất của Backend. Bấm `Ctrl + C` và chạy lại `./mvnw spring-boot:run` để code mới (cho phép lưu mã OTP vào database) được áp dụng.
- **Lỗi không nhận được Email OTP:** Kiểm tra lại file `.env` trong thư mục backend xem đã điền đúng `SMTP_USERNAME` và App Password (Mật khẩu ứng dụng của Gmail) chưa.
