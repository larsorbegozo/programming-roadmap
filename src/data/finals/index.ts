import type { FinalExam } from '../../types/checkpoint';
import { final0 } from './p0';
import { final1 } from './p1';
import { final2 } from './p2';
import { final3 } from './p3';
import { final4 } from './p4';
import { final5 } from './p5';
import { final6 } from './p6';
import { final7 } from './p7';
import { final8 } from './p8';
import { final9 } from './p9';
import { final10 } from './p10';
import { final11 } from './p11';

export const finals: Record<string, FinalExam> = Object.fromEntries(
  [final0, final1, final2, final3, final4, final5, final6, final7, final8, final9, final10, final11].map((f) => [f.phaseId, f]),
);

export function getFinal(phaseId: string): FinalExam | undefined {
  return finals[phaseId];
}
