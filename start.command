#!/bin/bash
# Đổi thư mục làm việc hiện tại sang thư mục chứa script
cd "$(dirname "$0")"

echo "=========================================="
echo "    KHỞI ĐỘNG HỆ THỐNG QUẢN LÝ LỊCH DẠY   "
echo "=========================================="

echo "[1/4] Kiểm tra thư viện Backend..."
if [ ! -d "node_modules" ]; then
    echo "Đang cài đặt thư viện Backend (Vui lòng đợi)..."
    npm install
fi

echo "[2/4] Kiểm tra thư viện Frontend..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "Đang cài đặt thư viện Frontend (Vui lòng đợi)..."
    npm install
fi
cd ..

echo "[3/4] Cập nhật Database (Prisma)..."
npx prisma generate
# npx prisma db push # Tạm tắt để tránh lỗi nếu cấu hình DB chưa đúng

echo "[4/4] Khởi động Server & Giao diện..."
# Chạy backend ngầm
npm run dev &
BACKEND_PID=$!

# Chạy frontend ngầm
cd frontend
npm run dev &
FRONTEND_PID=$!

cd ..

echo "=========================================="
echo " ✅ HỆ THỐNG ĐÃ CHẠY THÀNH CÔNG!"
echo " 🌐 Mở trình duyệt web và truy cập:"
echo "    http://localhost:5173"
echo "=========================================="
echo " (Để tắt hệ thống, nhấn phím Ctrl + C)"

# Giữ terminal mở và lắng nghe tín hiệu thoát để kill các process ngầm
trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
