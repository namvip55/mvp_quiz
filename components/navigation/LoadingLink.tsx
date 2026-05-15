"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import AiLoading from "@/components/loading/AiLoading";

type LoadingLinkProps = {
  href: string;
  className?: string;
  label?: string;
  enableLoading?: boolean;
  children: React.ReactNode;
};

export default function LoadingLink({
  href,
  className,
  label = "Đang chuyển trang...",
  enableLoading = false,
  children,
}: LoadingLinkProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [showLoading, setShowLoading] = useState(false);
  const [, startTransition] = useTransition();

  return (
    <>
      <Link
        href={href}
        className={className}
        onClick={(event) => {
          if (!enableLoading) return;
          if (event.defaultPrevented) return;
          if (event.button !== 0) return;
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          if (pathname === href) return;

          event.preventDefault();
          setShowLoading(true);

          requestAnimationFrame(() => {
            startTransition(() => {
              router.push(href);
            });
          });
        }}
      >
        {children}
      </Link>

      {showLoading && <AiLoading fullscreen label={label} />}
    </>
  );
}
