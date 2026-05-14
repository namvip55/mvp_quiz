import LoadingLink from "@/components/navigation/LoadingLink";
import { listExams } from "@/lib/supabase/examRepository";

export const dynamic = "force-dynamic";

export default async function ExamsPage() {
  const exams = await listExams();

  return (
    <div className="ui-page max-w-5xl">
      <div className="mb-4">
        <LoadingLink href="/" className="ui-btn-secondary text-sm" label="Đang về trang chủ...">
          ← Back
        </LoadingLink>
      </div>

      <div className="flex items-center justify-between gap-4">
        <h1 className="ui-heading-title">Danh sách đề thi</h1>
        <LoadingLink href="/create" className="ui-btn-primary" label="Đang mở trang tạo đề...">
          Tạo đề mới
        </LoadingLink>
      </div>

      {exams.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-hairline bg-surface-soft p-6 ui-muted">Chưa có đề nào.</p>
      ) : (
        <div className="mt-6 grid gap-4">
          {exams.map((exam) => (
            <div key={exam.id} className="ui-card p-5 transition hover:border-primary">
              <LoadingLink href={`/exams/${exam.id}`} className="block" label="Đang tải đề thi...">
                <h2 className="text-lg font-medium text-ink">{exam.title}</h2>
                <p className="mt-1 text-sm ui-muted">{exam.description || "Không có mô tả"}</p>
              </LoadingLink>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <LoadingLink href={`/exams/${exam.id}`} className="ui-btn-primary text-sm" label="Đang tải đề thi...">
                  Làm đề
                </LoadingLink>
                <LoadingLink
                  href={`/exams/${exam.id}?mode=practice`}
                  className="ui-btn-primary text-sm"
                  label="Đang mở chế độ luyện tập..."
                >
                  Luyện tập
                </LoadingLink>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
