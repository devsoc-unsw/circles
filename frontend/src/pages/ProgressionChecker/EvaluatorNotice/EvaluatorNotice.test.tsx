import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProgressionResult } from 'utils/degreeEval/evaluateProgression';
import { describe, expect, it } from 'vitest';
import EvaluatorNotice from './EvaluatorNotice';

const base = {
  structure: {},
  view: {},
  notCounted: [],
  totalUOC: 144,
  freeElectivesUOC: 0,
  status: 'unmet',
  summary: 'Not met. 0 of 144 UOC counted',
  unplacedSpecs: [],
  yearFallback: false,
  diagnostics: [],
  unplannedCount: 0,
  equivalents: [],
  undecided: []
} satisfies ProgressionResult;

describe('EvaluatorNotice', () => {
  it('shows only the verdict when nothing limits it', () => {
    const { container } = render(<EvaluatorNotice result={base} error={null} />);
    expect(screen.getByText(/Degree evaluator \(preview\): Not met/)).toBeTruthy();
    expect(container.querySelectorAll('li')).toHaveLength(0);
  });

  it('explains unplanned courses, equivalents and undecided requirements', () => {
    render(
      <EvaluatorNotice
        result={{
          ...base,
          unplannedCount: 11,
          equivalents: [{ code: 'DPST1091', item: 'Core Courses' }],
          undecided: ['Computing Electives']
        }}
        error={null}
      />
    );
    expect(
      screen.getByText("11 courses in Unplanned aren't counted until you place them in a term.")
    ).toBeTruthy();
    expect(
      screen.getByText(/DPST1091 counts towards Core Courses as an equivalent of a listed course/)
    ).toBeTruthy();
    expect(screen.getByText(/Can't be decided automatically.*Computing Electives/)).toBeTruthy();
  });

  it('uses the singular for one unplanned course', () => {
    render(<EvaluatorNotice result={{ ...base, unplannedCount: 1 }} error={null} />);
    expect(
      screen.getByText("1 course in Unplanned isn't counted until you place it in a term.")
    ).toBeTruthy();
  });
});
