// The evaluator's Web Worker (EVALUATOR.md §5.6).
import { serve } from '@circles/degree-eval';

// the worker's global scope is its message port
serve(globalThis);
