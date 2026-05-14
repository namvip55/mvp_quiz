import Image from "next/image";
import LoadingLink from "@/components/navigation/LoadingLink";

export default function Home() {
  return (
    <div className="ui-page flex min-h-[80vh] max-w-4xl flex-col items-center justify-center">
      <div className="mx-auto mb-6 flex w-full justify-center">
        <div className="overflow-hidden rounded-3xl border border-hairline bg-white p-1.5 shadow-sm">
          <Image
            src="/claude_waifu.png"
            alt="Claude girl"
            width={260}
            height={260}
            className="h-44 w-44 rounded-2xl object-cover sm:h-64 sm:w-64"
            priority
          />
        </div>
      </div>

      <div className="mt-10 grid w-full gap-4 sm:grid-cols-2">
        <LoadingLink href="/create" className="ui-card-soft block p-6 text-center transition hover:border-primary" label="Đang mở trang tạo đề...">
          <h2 className="ui-heading-title">Tạo đề thi</h2>
          <p className="mt-3 text-sm ui-muted">Upload DOCX hoặc dán text/HTML để parse câu hỏi.</p>
        </LoadingLink>

        <LoadingLink href="/exams" className="ui-card-soft block p-6 text-center transition hover:border-primary" label="Đang tải danh sách đề thi...">
          <h2 className="ui-heading-title">Làm đề thi</h2>
          <p className="mt-3 text-sm ui-muted">Xem danh sách đề, chọn đáp án và nộp bài.</p>
        </LoadingLink>
      </div>
    </div>
  );
}
