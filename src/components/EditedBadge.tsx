import React from 'react';
import { TimetableSession } from '../types';

/** Small "Edited" / "Yours" tag for classes the student changed or added themselves */
export const EditedBadge: React.FC<{ session: TimetableSession }> = ({ session }) => {
  if (!session.userEdited && !session.isCustom) return null;
  return (
    <span
      className={`ml-1.5 align-middle text-[9px] font-extrabold uppercase tracking-wide px-1.5 py-0.5 rounded ${
        session.isCustom
          ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300'
          : 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300'
      }`}
      title={session.isCustom ? 'A class you added' : 'You changed this class'}
    >
      {session.isCustom ? 'Yours' : 'Edited'}
    </span>
  );
};
