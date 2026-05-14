import Link from "next/link";
import { listExams } from "@/lib/supabase/examRepository";

export const dynamic = "force-dynamic";

export default async function ExamsPage() {
  const exams = await listExams();

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Danh sách đề thi</h1>
        <Link href="/create" className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white">
          Tạo đề mới
        </Link>
      </div>

      {exams.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-zinc-300 p-6 text-zinc-600">Chưa có đề nào.</p>
      ) : (
        <div className="mt-6 grid gap-4">
          {exams.map((exam) => (
            <Link
              key={exam.id}
              href={`/exams/${exam.id}`}
              className="rounded-xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-400"
            >
              <h2 className="text-lg font-semibold">{exam.title}</h2>
              <p className="mt-1 text-sm text-zinc-600">{exam.description || "Không có mô tả"}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
