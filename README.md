# MVP Quiz

Ứng dụng trắc nghiệm chạy trên **Next.js + Tailwind CSS + Supabase**.

## Tính năng chính

- Tạo đề thi từ file **DOCX** hoặc dán **text/HTML**.
- Parse câu hỏi theo cấu trúc `Câu <số>`.
- Nhận diện đáp án đúng từ markup màu đỏ (`<font color="red">`, `style="color:red"`, ...).
- Lưu đề thi vào Supabase.
- Làm bài theo 2 chế độ:
  - **Exam mode**: nộp bài và chấm điểm tổng.
  - **Practice mode**: luyện từng câu, xác nhận đáp án, có phím tắt.
- UI loading overlay cho điều hướng và thao tác chính.

## Cài đặt

```bash
npm install
```

## Thiết lập Supabase

### 1) Apply migration

Migration có sẵn tại:

- `supabase/migrations/20260514_create_quiz_schema.sql`

Chạy file SQL này trong Supabase SQL Editor để tạo các bảng:

- `exams`
- `questions`
- `options`

### 2) Environment variables

Tạo `.env.local` và điền:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Bạn có thể copy từ file mẫu:

```bash
cp .env.local.example .env.local
```

## Chạy local

```bash
npm run dev
```

Mở: `http://localhost:3000`

## Luồng sử dụng

- `/`:
  - vào nhanh trang **Tạo đề thi** hoặc **Làm đề thi**.
- `/create`:
  - upload `.docx` hoặc dán text/HTML,
  - parse preview,
  - lưu đề vào Supabase.
- `/exams`:
  - xem danh sách đề và chọn đề muốn làm.
- `/exams/[id]`:
  - làm bài chế độ exam,
  - hoặc chuyển sang practice bằng query `?mode=practice`.

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
```

## Deploy Vercel

1. Push code lên GitHub.
2. Import repo vào Vercel.
3. Thêm biến môi trường:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy.

Sau khi deploy, ứng dụng hoạt động đầy đủ khi migration đã được apply trên Supabase.

---

Tác giả: [namvip55](https://github.com/namvip55/mvp_quiz)  
Repo: https://github.com/namvip55/mvp_quiz
