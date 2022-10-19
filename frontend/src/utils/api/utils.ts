// returns an path that ignores undefined params
// eslint-disable-next-line import/prefer-default-export
export function optionalSegments(...segments: (string | undefined)[]): string {
  return segments.filter((s) => !!s).join('/');
}
