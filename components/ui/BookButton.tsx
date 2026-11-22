'use client';

import type { ReactNode } from 'react';
import { useStore } from '@/lib/store';

export function BookButton({ className, children }: { className: string; children: ReactNode }) {
  const open = useStore((s) => s.open);
  return <button type="button" className={className} onClick={open}>{children}</button>;
}

export function ReclinerButton() {
  const preview = useStore((s) => s.previewRecliner);
  return <button type="button" className="tk" onClick={preview}>Sit in a recliner</button>;
}
