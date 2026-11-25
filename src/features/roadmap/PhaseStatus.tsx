import { CheckCircle2, Circle, CircleDashed } from 'lucide-react';
import { Badge } from '../../components/ui';
import type { PhaseProgress } from '../../lib/progress';

export function PhaseStatusBadge({ status }: { status: PhaseProgress['status'] }) {
  if (status === 'completed')
    return (
      <Badge tone="success">
        <CheckCircle2 className="size-3" /> Completed
      </Badge>
    );
  if (status === 'in-progress')
    return (
      <Badge tone="accent">
        <Circle className="size-3" /> In progress
      </Badge>
    );
  return (
    <Badge>
      <CircleDashed className="size-3" /> Not started
    </Badge>
  );
}
