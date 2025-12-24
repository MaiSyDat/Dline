# Troubleshooting Vercel Deployment

## Lỗi 500 Internal Server Error

### Nguyên nhân thường gặp:

1. **DATABASE_URL chưa được cấu hình trên Vercel**
2. **MongoDB connection string không đúng**
3. **MongoDB Atlas chưa whitelist IP của Vercel**
4. **Timeout khi kết nối MongoDB**

### Giải pháp:

#### 1. Kiểm tra Environment Variables trên Vercel

1. Vào Vercel Dashboard → Project → Settings → Environment Variables
2. Đảm bảo có các biến sau:
   - `DATABASE_URL`: MongoDB connection string
   - `MONGODB_DB`: Tên database (mặc định: `dline`)

3. **Format DATABASE_URL đúng:**
   ```
   # MongoDB Atlas
   mongodb+srv://username:password@cluster.mongodb.net/dline?retryWrites=true&w=majority
   
   # MongoDB tự host (có authentication)
   mongodb://username:password@host:27017/dline
   
   # MongoDB local (không dùng trên Vercel)
   mongodb://localhost:27017/dline
   ```

#### 2. Kiểm tra MongoDB Atlas Network Access

1. Vào MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. Thêm `0.0.0.0/0` để cho phép từ mọi nơi (hoặc IP của Vercel)
4. Hoặc thêm IP cụ thể của Vercel functions

#### 3. Kiểm tra MongoDB Database User

1. Vào MongoDB Atlas → Database Access
2. Đảm bảo user có quyền read/write
3. Kiểm tra username/password đúng trong connection string

#### 4. Xem Logs trên Vercel

1. Vào Vercel Dashboard → Project → Deployments
2. Click vào deployment mới nhất
3. Xem tab "Functions" để xem error logs
4. Tìm error message cụ thể

#### 5. Test API trực tiếp

```bash
# Test db-check endpoint
curl https://dline.vercel.app/api/db-check

# Test login (sau khi đã tạo user)
curl -X POST https://dline.vercel.app/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@dline.com","password":"123"}'
```

### Các lỗi cụ thể:

#### "DATABASE_URL chưa được cấu hình"
- **Nguyên nhân**: Environment variable chưa được set
- **Giải pháp**: Thêm `DATABASE_URL` trong Vercel Settings → Environment Variables
- **Lưu ý**: Phải redeploy sau khi thêm env vars

#### "MongoServerError: Authentication failed"
- **Nguyên nhân**: Username/password sai hoặc user không có quyền
- **Giải pháp**: 
  - Kiểm tra username/password trong connection string
  - Tạo user mới trong MongoDB Atlas với quyền read/write

#### "MongoServerSelectionError: connect ECONNREFUSED"
- **Nguyên nhân**: MongoDB Atlas chưa whitelist IP
- **Giải pháp**: Thêm `0.0.0.0/0` vào Network Access

#### "MongoServerSelectionError: connection timeout"
- **Nguyên nhân**: MongoDB không thể truy cập được
- **Giải pháp**:
  - Kiểm tra connection string đúng
  - Kiểm tra MongoDB Atlas cluster đang chạy
  - Tăng timeout trong code (đã được set 10s)

### Debug Steps:

1. **Kiểm tra db-check endpoint:**
   ```
   https://dline.vercel.app/api/db-check
   ```
   Nếu endpoint này trả về lỗi → vấn đề ở MongoDB connection

2. **Kiểm tra environment variables:**
   - Vào Vercel Dashboard → Settings → Environment Variables
   - Đảm bảo có `DATABASE_URL` và `MONGODB_DB`

3. **Redeploy sau khi sửa env vars:**
   - Vào Deployments → Click "..." → Redeploy
   - Hoặc push commit mới để trigger redeploy

4. **Xem function logs:**
   - Vercel Dashboard → Project → Functions
   - Xem real-time logs khi test API

### Best Practices:

1. **Luôn test db-check trước:**
   - Endpoint này đơn giản nhất, dễ debug

2. **Sử dụng MongoDB Atlas cho production:**
   - Free tier đủ cho development
   - Dễ quản lý và scale

3. **Không commit .env.local:**
   - File này đã được ignore trong .gitignore

4. **Monitor logs:**
   - Xem Vercel logs thường xuyên để catch errors sớm

### Quick Fix Checklist:

- [ ] DATABASE_URL đã được set trên Vercel
- [ ] MONGODB_DB đã được set (hoặc dùng default)
- [ ] MongoDB Atlas Network Access đã whitelist 0.0.0.0/0
- [ ] MongoDB user có quyền read/write
- [ ] Connection string format đúng
- [ ] Đã redeploy sau khi sửa env vars
- [ ] Đã test /api/db-check endpoint

