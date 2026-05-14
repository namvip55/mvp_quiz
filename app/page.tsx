import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto flex min-h-[80vh] w-full max-w-3xl flex-col items-center justify-center px-4 py-10">
      <h1 className="text-center text-3xl font-bold">MVP Quiz - Thi trắc nghiệm</h1>
      <p className="mt-3 text-center text-zinc-600">Tạo đề thi từ DOCX/text và làm bài trực tiếp.</p>

      <div className="mt-8 grid w-full gap-4 sm:grid-cols-2">
        <Link
          href="/create"
          className="rounded-xl border border-zinc-200 bg-white p-6 text-center transition hover:border-zinc-400"
        >
          <h2 className="text-lg font-semibold">Tạo đề thi</h2>
          <p className="mt-2 text-sm text-zinc-600">Upload DOCX hoặc dán text/HTML để parse câu hỏi.</p>
        </Link>

        <Link
          href="/exams"
          className="rounded-xl border border-zinc-200 bg-white p-6 text-center transition hover:border-zinc-400"
        >
          <h2 className="text-lg font-semibold">Làm đề thi</h2>
          <p className="mt-2 text-sm text-zinc-600">Xem danh sách đề, chọn đáp án và nộp bài.</p>
        </Link>
      </div>
    </div>
  );
}
