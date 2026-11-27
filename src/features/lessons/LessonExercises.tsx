import { useState } from 'react';
import { Download } from 'lucide-react';
import { Badge, Button } from '../../components/ui';
import { useAppState } from '../../hooks/useAppState';
import { buildExerciseFile, fileNameFor, stripChecks } from '../../lib/exerciseFile';
import { downloadFile } from '../../lib/storage';
import type { Lesson, Phase } from '../../types/curriculum';
import type { LessonExercise } from '../../types/checkpoint';
import { ProblemCard } from '../checkpoints/ProblemCard';

export function LessonExercises({ phase, lesson, exercises }: { phase: Phase; lesson: Lesson; exercises: LessonExercise[] }) {
  const { state, dispatch } = useAppState();
  const [open, setOpen] = useState<string | null>(() => exercises.find((e) => !state.lessonExercises[e.id]?.passedAt)?.id ?? null);

  return (
    <div className="flex flex-col gap-3">
      {exercises.map((exercise, i) => (
        <ProblemCard
          key={exercise.id}
          phase={phase}
          problem={exercise}
          index={i}
          open={open === exercise.id}
          onToggle={() => setOpen((current) => (current === exercise.id ? null : exercise.id))}
          hideLessonLink
          prepareCode={stripChecks}
          store={{
            progress: state.lessonExercises[exercise.id],
            save: (code) => dispatch({ type: 'saveExerciseCode', exerciseId: exercise.id, code }),
            markPassed: (code) => dispatch({ type: 'markExercisePassed', exerciseId: exercise.id, code }),
          }}
          badge={exercise.level === 'core' ? <Badge>Core · required</Badge> : <Badge>Challenge · optional</Badge>}
          toolbar={(code) =>
            exercise.language === 'js' && (
              <Button
                variant="ghost"
                onClick={() =>
                  downloadFile(
                    fileNameFor(exercise),
                    buildExerciseFile(exercise, code, { heading: `Lyra Roadmap · Phase ${phase.number}, Lesson ${lesson.number}: ${lesson.title}` }),
                    'text/javascript',
                  )
                }
                title="Download a .js file with this exercise and its checks, to solve in VS Code and run with node"
              >
                <Download className="size-4" /> Open in VS Code
              </Button>
            )
          }
        />
      ))}
    </div>
  );
}
