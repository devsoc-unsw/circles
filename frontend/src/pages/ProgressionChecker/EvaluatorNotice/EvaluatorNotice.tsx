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
    'Faculty, General Education and equivalence data are not loaded yet, so requirements that depend on them may show as not met.'
  ];

  return (
    <Alert
      type={result.status === 'met' ? 'success' : result.status === 'unmet' ? 'warning' : 'info'}
      showIcon
      message={`Degree evaluator (preview): ${result.summary}`}
      description={
        <ul>
          {caveats.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      }
    />
  );
};

export default EvaluatorNotice;
