# UI Components Structure

## Cấu trúc thư mục

```
ui/
├── components/          # Components dùng chung (reusable)
│   ├── Button.tsx       # Button component với variants
│   ├── Input.tsx        # Input component với label/error
│   ├── Textarea.tsx     # Textarea component
│   ├── Select.tsx       # Select dropdown component
│   ├── Badge.tsx        # Badge component cho status/tags
│   ├── Loading.tsx       # Loading spinner component
│   ├── Avatar.tsx       # Avatar component với fallback
│   ├── Modal.tsx        # Modal component với backdrop
│   └── index.ts         # Export tất cả components
│
├── layouts/             # Layout components
│   ├── Sidebar.tsx      # Sidebar navigation
│   ├── Header.tsx       # Header bar với search/actions
│   ├── MobileNav.tsx    # Bottom navigation cho mobile
│   └── index.ts         # Export tất cả layouts
│
├── features/            # Feature-specific components
│   ├── auth/
│   │   └── LoginForm.tsx    # Login form component
│   ├── dashboard/       # Dashboard components (TODO)
│   ├── projects/        # Project components (TODO)
│   ├── tasks/
│   │   └── StatusBadge.tsx  # Task status badge
│   ├── team/            # Team components (TODO)
│   ├── shared/
│   │   ├── SearchableUserSelect.tsx  # User multi-select
│   │   ├── ImageUpload.tsx           # Image upload với preview
│   │   └── Lightbox.tsx              # Full-screen image viewer
│   └── index.ts         # Export tất cả features
│
├── hooks/               # Custom React hooks (TODO)
├── utils/               # Utility functions
│   └── api.ts           # API fetch utilities
│
└── README.md            # Documentation này
```

## Quy tắc sử dụng

### 1. Components dùng chung (`ui/components/`)
- Tái sử dụng được ở nhiều nơi
- Có props interface rõ ràng
- Có TypeScript types đầy đủ
- Có comments giải thích

### 2. Layout components (`ui/layouts/`)
- Quản lý cấu trúc layout chính
- Sidebar, Header, MobileNav
- Nhận props từ parent component

### 3. Feature components (`ui/features/`)
- Component dành riêng cho một feature
- Có thể import components dùng chung
- Tổ chức theo feature (auth, dashboard, projects, tasks, team)

### 4. Shared components (`ui/features/shared/`)
- Component dùng chung giữa các features
- Ví dụ: SearchableUserSelect, ImageUpload, Lightbox

## Import paths

Sử dụng relative paths trong cùng thư mục:
```typescript
// Trong ui/features/auth/LoginForm.tsx
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
```

Hoặc sử dụng alias `@/ui/` nếu đã config:
```typescript
import { Input, Button } from '@/ui/components';
```

## Comments

Tất cả components đều có:
- File header comment giải thích chức năng
- Interface/Props comments
- Function comments cho các hàm quan trọng
- Inline comments cho logic phức tạp

## Bảo mật

- Không hardcode sensitive data
- Validate input từ user
- Sanitize data trước khi hiển thị
- Sử dụng TypeScript để type safety

