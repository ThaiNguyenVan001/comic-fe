# Ứng dụng Đọc Truyện Tranh

Ứng dụng web Angular để đọc truyện tranh với các tính năng:
- Danh sách truyện tranh
- Chi tiết truyện (ảnh bìa, tên, tác giả, tóm tắt, danh sách chương)
- Đọc chương truyện

## Cài đặt

1. Cài đặt dependencies:
```bash
npm install
```

2. Chạy ứng dụng:
```bash
npm start
```

3. Mở trình duyệt và truy cập: `http://localhost:4200`

## Cấu trúc dự án

- `src/app/components/` - Các component chính
  - `comic-list/` - Màn hình danh sách truyện
  - `comic-detail/` - Màn hình chi tiết truyện
  - `chapter-reader/` - Màn hình đọc chương
- `src/app/services/` - Services quản lý dữ liệu
- `src/app/models/` - Models và interfaces

## Tính năng

- ✅ Hiển thị danh sách truyện với ảnh bìa
- ✅ Trang chi tiết truyện với thông tin đầy đủ
- ✅ Danh sách các chương
- ✅ Đọc chương với điều hướng giữa các chương
- ✅ Responsive design cho mobile và desktop

