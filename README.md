# D-Line Task Manager

Hệ thống quản lý công việc và dự án chuyên nghiệp, được xây dựng với Next.js 14 và MongoDB.

## Tính năng

- ✅ Quản lý dự án và công việc
- ✅ Kanban board với phân loại tự động
- ✅ Quản lý nhân sự và phân quyền
- ✅ Dashboard tổng quan
- ✅ Upload và xem hình ảnh đính kèm
- ✅ Kết nối MongoDB

## Công nghệ

- **Framework**: Next.js 14 (App Router)
- **Database**: MongoDB
- **UI**: React, Tailwind CSS, Heroicons
- **TypeScript**: Full type safety

## Cài đặt

1. Clone repository:
```bash
git clone <repo-url>
cd d-line
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Tạo file `.env.local`:
```env
DATABASE_URL=mongodb://localhost:27017/dline
MONGODB_DB=dline
API_KEY=your-gemini-api-key-optional
```

4. Chạy development server:
```bash
npm run dev
```

5. Mở [http://localhost:3000](http://localhost:3000)

## Deploy lên Vercel

1. Push code lên GitHub/GitLab/Bitbucket

2. Kết nối repository với Vercel:
   - Vào [vercel.com](https://vercel.com)
   - Import project từ Git repository
   - Vercel sẽ tự động detect Next.js

3. Cấu hình Environment Variables trong Vercel:
   - `DATABASE_URL`: MongoDB connection string (ví dụ: `mongodb+srv://user:pass@cluster.mongodb.net/dline`)
   - `MONGODB_DB`: Tên database (mặc định: `dline`)
   - `API_KEY`: (Optional) Gemini API key

4. Deploy:
   - Vercel sẽ tự động build và deploy
   - Kiểm tra logs nếu có lỗi

## Cấu trúc dự án

```
d-line/
├── app/
│   ├── api/          # API routes
│   ├── layout.tsx    # Root layout
│   └── page.tsx      # Home page
├── components/
│   └── AppShell.tsx  # Main application component
├── lib/
│   └── db.ts         # MongoDB connection & utilities
├── types.ts          # TypeScript types
└── ...
```

## API Endpoints

- `GET /api/users` - Lấy danh sách users
- `POST /api/users` - Tạo user mới
- `POST /api/users/login` - Đăng nhập
- `GET /api/projects` - Lấy danh sách projects
- `POST /api/projects` - Tạo project mới
- `PUT /api/projects/[id]` - Cập nhật project
- `DELETE /api/projects/[id]` - Xóa project
- `GET /api/tasks` - Lấy danh sách tasks
- `POST /api/tasks` - Tạo task mới
- `PUT /api/tasks/[id]` - Cập nhật task
- `DELETE /api/tasks/[id]` - Xóa task
- `GET /api/db-check` - Kiểm tra kết nối database

## Scripts

- `npm run dev` - Development server
- `npm run build` - Build production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Lưu ý

- Đảm bảo MongoDB đang chạy trước khi start app
- Tạo user đầu tiên qua API trước khi đăng nhập
- MongoDB connection được tối ưu cho serverless (Vercel)

