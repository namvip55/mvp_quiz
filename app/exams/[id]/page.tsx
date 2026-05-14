import Link from "next/link";
import { getExamDetail } from "@/lib/supabase/examRepository";
import TakeExamClient from "@/app/exams/[id]/TakeExamClient";

export const dynamic = "force-dynamic";

async function loadExam(id: string) {
  try {
    const exam = await getExamDetail(id);
    return { exam, error: "" };
  } catch (e) {
    return {
      exam: null,
      error: e instanceof Error ? e.message : "Không tải được đề thi.",
    };
  }
}

export default async function TakeExamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await loadExam(id);

  if (!result.exam) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <p className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">{result.error}</p>
        <Link href="/exams" className="mt-4 inline-block text-sm underline">
          Quay lại danh sách đề
        </Link>
      </div>
    );
  }

  return <TakeExamClient exam={result.exam} />;
}
