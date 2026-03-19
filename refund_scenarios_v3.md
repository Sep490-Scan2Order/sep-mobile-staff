# Kịch bản Dữ liệu: 3 Luồng Xử lý Lỗi & Hoàn tiền (V3 - Final)

Dưới đây là bảng mô phỏng dữ liệu phản ánh đúng logic Code hiện tại.

---

### Kịch bản 1: Lỗi Khách quan (Cúp điện, thiên tai...)
*Đặc điểm: Nhà hàng chịu trách nhiệm, trích két trả khách ngay.*

| Bảng | Trạng thái / Dữ liệu |
| :--- | :--- |
| **Order Gốc** | Chuyển sang **`Cancelled`** (Để trừ doanh thu) |
| **Order 0đ** | **Đã tạo** (Ghi chú: "Hoàn tiền mặt do cúp điện") |
| **Transaction** | **Đã tạo (-150.000)** - Loại [Cash](file:///d:/Achire/FPTDocument/SEP490/sep-backend/ScanToOrder.Api/Controllers/OrderController.cs#45-52) (Để khớp két tiền mặt) |

---

### Kịch bản 2: Lỗi Nhân viên (Đưa nhầm món, làm hỏng món...)
*Đặc điểm: Nhân viên tự bỏ tiền túi đền cho khách, không lấy tiền của quán.*

| Bảng | Trạng thái / Dữ liệu |
| :--- | :--- |
| **Order Gốc** | Chuyển sang **`Cancelled`** (Tại quán khách không ăn nên không tính tiền) |
| **Order 0đ** | **Đã tạo** (Ghi chú: "NV A tự đền tiền túi", ghi nhận `ResponsibleStaffId`) |
| **Transaction** | **KHÔNG CÓ** (Tiền trong két quán không bị mất đi) |

---

### Kịch bản 3: Lỗi Hệ thống (Thanh toán lỗi, App treo...)
*Đặc điểm: Khách đã bị trừ tiền nhưng đơn vẫn báo Unpaid. Do là mô hình Trả trước nên không hoàn tiền, chỉ xác nhận để khách ăn.*

| Bảng | Trạng thái / Dữ liệu |
| :--- | :--- |
| **Order Gốc** | Chuyển sang **[Pending](file:///d:/Achire/FPTDocument/SEP490/sep-backend/ScanToOrder.Api/Controllers/OrderController.cs#61-68)** (Gửi bếp làm món ngay) |
| **Minh chứng** | **Đã đính kèm ảnh chụp màn hình thanh toán** (`PaymentProofUrl`) |
| **Transaction** | **Đã tạo (+150.000)** - Loại `BankTransfer` (Khớp doanh thu hệ thống với bank) |

---

### Tóm tắt so sánh:
| Loại lỗi | Trạng thái đơn | Tạo đơn 0đ | Log âm két | Thêm ảnh/Proof |
| :--- | :--- | :--- | :--- | :--- |
| **Khách quan** | Cancelled | Có | **Có** | Không |
| **Nhân viên** | Cancelled | Có | **Không** | Không |
| **Hệ thống** | **Pending** | **Không** | **Không** | **Có** |
