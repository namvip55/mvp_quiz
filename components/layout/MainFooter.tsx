import Link from "next/link";

export default function MainFooter() {
  return (
    <footer className="mt-auto border-t border-hairline bg-canvas">
      <div className="mx-auto w-full max-w-6xl px-4 py-4 text-sm ui-muted">
        <p>MVP Quiz · Ôn tập hiệu quả mỗi ngày</p>
        <p className="mt-1">
          Tác giả: <Link href="https://github.com/namvip55/mvp_quiz" target="_blank" rel="noreferrer" className="underline">namvip55</Link>
        </p>
      </div>
    </footer>
  );
}
