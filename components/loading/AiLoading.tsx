import Image from "next/image";

type AiLoadingProps = {
  fullscreen?: boolean;
  label?: string;
};

export default function AiLoading({ fullscreen = false, label = "Đang xử lý..." }: AiLoadingProps) {
  return (
    <div className={fullscreen ? "ui-loading-screen" : "ui-loading-overlay"} role="status" aria-live="polite" aria-busy="true">
      <div className="ui-loading-shell">
        <div className="ui-loading-ring" aria-hidden="true" />
        <div className="ui-loading-glow" aria-hidden="true" />
        <div className="ui-loading-image-wrap">
          <Image src="/loading_image.jpg" alt="Loading" width={88} height={88} className="ui-loading-image" priority />
        </div>
      </div>
      <p className="ui-loading-label">{label}</p>
    </div>
  );
}
