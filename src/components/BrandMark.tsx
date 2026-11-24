import { useState } from 'react';

interface BrandMarkProps {
  variant?: 'wordmark' | 'icon';
  className?: string;
}

const LOGO_WORDMARK_SRC = '/assets/aistudio/WhatsApp_Image_2026-11-20_at_23.47.16__1__d4378a43.jpeg';
const LOGO_ICON_SRC = '/assets/aistudio/WhatsApp_Image_2026-11-20_at_23.47.17_7b9a96a4.jpeg';

export function BrandMark({ variant = 'wordmark', className = 'h-8 w-auto' }: BrandMarkProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className="inline-flex items-center gap-1.5 font-display font-bold tracking-tight text-white">
        <span className="text-[#C4C8D0]">CS</span>
        <span className="text-[#E86A14]">22</span>
      </span>
    );
  }

  return (
    <img
      src={variant === 'icon' ? LOGO_ICON_SRC : LOGO_WORDMARK_SRC}
      alt="CS22"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`object-contain select-none ${className}`}
    />
  );
}
