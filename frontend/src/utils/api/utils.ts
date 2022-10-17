import { AxiosResponse } from "axios";

// returns an path that ignores undefined params
export function optionalSegments(...segments: (string | undefined)[]): string {
  return segments.filter(s => !!s).join("/")
};