import type { ReactNode } from 'react';

/** Paper cinema ticket: stub, perforation, notched edges. Server component. */
export function Ticket({ reel, tag, children }: { reel: string; tag: string; children: ReactNode }) {
  return (
    <div className="tw">
      <article className="ticket">
        <div className="stub mono"><span>{reel}</span><span>{tag}</span></div>
        <div className="tb">{children}</div>
      </article>
    </div>
  );
}
