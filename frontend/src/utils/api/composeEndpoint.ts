// returns an path that ignores undefined params
function composeEndpoint(...segments: (string | undefined)[]): string {
  return segments.filter((s) => !!s).join('/');
}

export default composeEndpoint;
