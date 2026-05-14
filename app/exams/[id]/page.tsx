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
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mode?: string | string[] }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const rawMode = Array.isArray(query.mode) ? query.mode[0] : query.mode;
  const mode = rawMode === "practice" ? "practice" : "exam";
  const result = await loadExam(id);

  if (!result.exam) {
    return (
      <div className="ui-page max-w-4xl">
        <p className="ui-alert-error">{result.error}</p>
        <Link href="/exams" className="ui-link mt-4 inline-block text-sm">
          Quay lại danh sách đề
        </Link>
      </div>
    );
  }

  return <TakeExamClient exam={result.exam} mode={mode} />;
}
