'use client';

import type { ReactNode } from 'react';
import { useStore } from '@/lib/store';

/** `flat` is the label used when the 3D hall is off (weak phones, no WebGL). */
export function BookButton({ className, children, flat }: { className: string; children: ReactNode; flat?: ReactNode }) {
  const open = useStore((s) => s.open);
  const no3d = useStore((s) => s.lite || s.glFailed);
  return <button type="button" className={className} onClick={open}>{no3d && flat ? flat : children}</button>;
}

export function ReclinerButton() {
  const preview = useStore((s) => s.previewRecliner);
  const no3d = useStore((s) => s.lite || s.glFailed);
  return <button type="button" className="tk" onClick={preview}>{no3d ? 'Pick a recliner' : 'Sit in a recliner'}</button>;
}
