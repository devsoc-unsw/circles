import React from 'react';
import { Alert } from 'antd';
import { ProgressionResult } from 'utils/degreeEval/evaluateProgression';

type Props = {
  result: ProgressionResult | undefined;
  error: Error | null;
};

// The evaluator's overall verdict, and what limits it, above the progression view.
const EvaluatorNotice = ({ result, error }: Props) => {
  if (error) {
    return (
      <Alert
        type="error"
        showIcon
        message="The degree evaluator failed"
        description={error.message}
      />
    );
  }
  if (!result) return null;

  const errors = result.diagnostics.filter((d) => d.level === 'error');
  const caveats = [
    ...(result.unplacedSpecs.length
      ? [`Not in your program's documents, so not checked: ${result.unplacedSpecs.join(', ')}.`]
      : []),
    ...(result.yearFallback
      ? ['There is no document for your start year; the nearest year was used.']
      : []),
    ...(errors.length
      ? [`${errors.length} problems were found loading the degree documents.`]
      : []),
    ...(result.unplannedCount
      ? [
          `${result.unplannedCount} ${result.unplannedCount === 1 ? 'course' : 'courses'} in Unplanned ${
            result.unplannedCount === 1 ? "isn't" : "aren't"
          } counted until you place ${result.unplannedCount === 1 ? 'it' : 'them'} in a term.`
        ]
      : []),
    ...result.equivalents.map(
      ({ code, item }) =>
        `${code} counts towards ${item} as an equivalent of a listed course. Equivalent courses also exclude each other, so you can only count one of them.`
    ),
    ...(result.undecided.length
      ? [
          `Can't be decided automatically, because a course could count towards two requirements and the degree rules don't say whether it may: ${result.undecided.join(
            ', '
          )}. Check these against the handbook.`
        ]
      : [])
  ];

  return (
    <Alert
      type={result.status === 'met' ? 'success' : result.status === 'unmet' ? 'warning' : 'info'}
      showIcon
      message={`Degree evaluator (preview): ${result.summary}`}
      description={
        caveats.length ? (
          <ul>
            {caveats.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        ) : undefined
      }
    />
  );
};

export default EvaluatorNotice;
