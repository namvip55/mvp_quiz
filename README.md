# MVP Quiz (Next.js + Tailwind + Supabase)

Ứng dụng thi trắc nghiệm MVP:
- Tạo đề thi từ **DOCX** hoặc **text/HTML fallback**.
- Parse câu hỏi theo quy tắc `Câu <số>`.
- Nhận diện đáp án đúng khi dòng đáp án có màu đỏ (`<font color="red">`, `style="color:red"`, ...).
- Làm đề và chấm điểm ngay trên giao diện.
- Không yêu cầu đăng ký/đăng nhập.

## 1) Cài đặt

```bash
npm install
```

## 2) Thiết lập Supabase

### Schema migration
File migration đã có sẵn tại:
- `supabase/migrations/20260514_create_quiz_schema.sql`

Bạn chạy file SQL này trên Supabase SQL Editor để tạo các bảng:
- `exams`
- `questions`
- `options`

Có trigger đảm bảo mỗi câu hỏi luôn có đúng 1 đáp án đúng.

### Environment
Tạo `.env.local` từ `.env.local.example`:

```bash
cp .env.local.example .env.local
```

Điền giá trị:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## 3) Chạy local

```bash
npm run dev
```

Mở `http://localhost:3000`.

## 4) Luồng sử dụng

- `/create`: tạo đề thi
  - Upload `.docx` hoặc dán text/HTML fallback.
  - Parse preview JSON.
  - Lưu đề vào Supabase.
- `/exams`: danh sách đề thi.
- `/exams/[id]`: làm đề và nộp bài để xem điểm.

## 5) Build/Lint

```bash
npm run lint
npm run build
```

## 6) Deploy Vercel

1. Push code lên GitHub.
2. Import repo vào Vercel.
3. Trong Vercel Project Settings -> Environment Variables, thêm:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy.

Sau deploy, app sẽ hoạt động đầy đủ nếu schema Supabase đã được apply.