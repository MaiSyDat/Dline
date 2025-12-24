# Hướng dẫn Deploy lên Vercel

## Bước 1: Chuẩn bị MongoDB

### Option 1: MongoDB Atlas (Khuyến nghị cho production)

1. Tạo tài khoản tại [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Tạo cluster mới (chọn free tier nếu muốn)
3. Tạo database user:
   - Database Access → Add New Database User
   - Lưu username và password
4. Whitelist IP:
   - Network Access → Add IP Address
   - Thêm `0.0.0.0/0` để cho phép từ mọi nơi (hoặc IP của Vercel)
5. Lấy connection string:
   - Clusters → Connect → Connect your application
   - Copy connection string, thay `<password>` bằng password đã tạo
   - Ví dụ: `mongodb+srv://username:password@cluster.mongodb.net/dline?retryWrites=true&w=majority`

### Option 2: MongoDB tự host

- Đảm bảo MongoDB server có thể truy cập từ internet
- Connection string: `mongodb://user:pass@host:27017/dline`

## Bước 2: Deploy lên Vercel

### Cách 1: Deploy qua Vercel Dashboard

1. **Push code lên Git repository** (GitHub/GitLab/Bitbucket)

2. **Kết nối với Vercel**:
   - Vào [vercel.com](https://vercel.com)
   - Đăng nhập và chọn "Add New Project"
   - Import repository từ Git provider

3. **Cấu hình Project**:
   - Framework Preset: Next.js (tự động detect)
   - Root Directory: `./` (mặc định)
   - Build Command: `npm run build` (mặc định)
   - Output Directory: `.next` (mặc định)

4. **Thêm Environment Variables**:
   - Vào Settings → Environment Variables
   - Thêm các biến sau:
     ```
     DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/dline?retryWrites=true&w=majority
     MONGODB_DB=dline
     API_KEY=your-gemini-key-optional
     ```
   - Chọn môi trường: Production, Preview, Development (nếu cần)

5. **Deploy**:
   - Click "Deploy"
   - Chờ build hoàn tất
   - Kiểm tra logs nếu có lỗi

### Cách 2: Deploy qua Vercel CLI

1. **Cài đặt Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Thêm Environment Variables**:
   ```bash
   vercel env add DATABASE_URL
   vercel env add MONGODB_DB
   vercel env add API_KEY
   ```

5. **Deploy production**:
   ```bash
   vercel --prod
   ```

## Bước 3: Kiểm tra sau khi deploy

1. **Kiểm tra kết nối database**:
   - Truy cập: `https://your-app.vercel.app/api/db-check`
   - Kết quả mong đợi: `{"ok":true,"result":{"ok":1,"db":"dline"},"collections":["users","projects","tasks"]}`

2. **Tạo user đầu tiên**:
   ```bash
   curl -X POST https://your-app.vercel.app/api/users \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Admin",
       "email": "admin@dline.com",
       "password": "123",
       "role": "admin"
     }'
   ```

3. **Đăng nhập và sử dụng**:
   - Truy cập: `https://your-app.vercel.app`
   - Đăng nhập với email/password vừa tạo

## Troubleshooting

### Lỗi kết nối MongoDB

- Kiểm tra `DATABASE_URL` đúng format
- Kiểm tra MongoDB Atlas đã whitelist IP `0.0.0.0/0`
- Kiểm tra username/password đúng
- Kiểm tra network access trong MongoDB Atlas

### Lỗi build

- Kiểm tra logs trong Vercel dashboard
- Đảm bảo tất cả dependencies đã được cài đặt
- Kiểm tra TypeScript errors: `npm run build` local trước

### Lỗi runtime

- Kiểm tra environment variables đã được set
- Kiểm tra MongoDB connection string
- Xem logs trong Vercel dashboard → Functions

## Tối ưu thêm

- **Custom Domain**: Vào Settings → Domains để thêm domain riêng
- **Analytics**: Bật Vercel Analytics để theo dõi performance
- **Monitoring**: Sử dụng Vercel Logs để debug

## Lưu ý

- MongoDB connection được tối ưu cho serverless (connection pooling)
- API routes sử dụng `runtime: 'nodejs'` và `dynamic: 'force-dynamic'`
- Build output đã được tối ưu cho production

