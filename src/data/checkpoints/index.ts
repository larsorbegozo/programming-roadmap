import type { Checkpoint } from '../../types/checkpoint';
import { p0 } from './p0';
import { p1 } from './p1';
import { p2 } from './p2';
import { p3 } from './p3';
import { p4 } from './p4';
import { p5 } from './p5';
import { p6 } from './p6';
import { p7 } from './p7';
import { p8 } from './p8';
import { p9 } from './p9';
import { p10 } from './p10';
import { p11 } from './p11';

export const checkpoints: Record<string, Checkpoint> = Object.fromEntries(
  [p0, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11].map((c) => [c.phaseId, c]),
);

export function getCheckpoint(phaseId: string): Checkpoint | undefined {
  return checkpoints[phaseId];
}
