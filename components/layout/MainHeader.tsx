import LoadingLink from "@/components/navigation/LoadingLink";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/create", label: "Tạo đề" },
  { href: "/exams", label: "Danh sách đề" },
];

export default function MainHeader() {
  return (
    <header className="border-b border-hairline bg-canvas/95 backdrop-blur supports-[backdrop-filter]:bg-canvas/80">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <LoadingLink href="/" className="text-sm font-semibold text-ink" label="Đang về trang chủ...">
          MVP Quiz
        </LoadingLink>

        <nav className="flex flex-wrap items-center gap-2">
          {navItems.map((item) => (
            <LoadingLink key={item.href} href={item.href} className="ui-btn-secondary text-sm" label="Đang chuyển trang...">
              {item.label}
            </LoadingLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
