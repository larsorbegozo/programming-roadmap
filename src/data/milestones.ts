import type { Milestone } from '../types/curriculum';
import { curriculum } from './curriculum';

export interface MilestoneDefinition extends Milestone {
  kind: 'phase' | 'habit';
  /** For phase milestones: the phase that must be fully complete. */
  phaseId?: string;
}

const phaseMilestoneCopy: Record<string, string> = {
  p0: 'Environment ready',
  p1: 'JavaScript foundations',
  p2: 'Modern JavaScript',
  p3: 'Typed code',
  p4: 'React builder',
  p5: 'First mobile apps',
  p6: 'Data in the cloud',
  p7: 'Professional workflow',
  p8: 'Lyra prototype',
  p9: 'Lyra MVP built',
  p10: 'Release-ready',
  p11: 'Privacy-ready',
};

export const phaseMilestones: MilestoneDefinition[] = curriculum.map((phase) => ({
  id: `phase-${phase.id}`,
  kind: 'phase',
  phaseId: phase.id,
  title: phaseMilestoneCopy[phase.id] ?? phase.title,
  description: `Complete Phase ${phase.number} — ${phase.title}: every lesson, the checkpoint and the final exam.`,
}));

export const habitMilestones: MilestoneDefinition[] = [
  { id: 'first-lesson', kind: 'habit', title: 'First step', description: 'Complete your first lesson.' },
  { id: 'ten-lessons', kind: 'habit', title: 'Ten lessons', description: 'Complete 10 lessons.' },
  { id: 'halfway', kind: 'habit', title: 'Halfway there', description: 'Reach 50% of the roadmap.' },
  { id: 'hours-10', kind: 'habit', title: '10 hours studied', description: 'Log 10 hours of study time.' },
  { id: 'hours-50', kind: 'habit', title: '50 hours studied', description: 'Log 50 hours of study time.' },
  { id: 'hours-100', kind: 'habit', title: '100 hours studied', description: 'Log 100 hours of study time.' },
  { id: 'streak-7', kind: 'habit', title: 'Seven-day streak', description: 'Study on 7 consecutive days.' },
  { id: 'full-week', kind: 'habit', title: 'Full week', description: 'Hit your weekly hour target in a single week.' },
];

export const allMilestones: MilestoneDefinition[] = [...phaseMilestones, ...habitMilestones];
