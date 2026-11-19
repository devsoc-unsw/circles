// Runtime helpers the generated validators call (see scripts/build-validators.ts). They replace
// Ajv's own runtime modules so the bundle carries no Ajv code.

// String length in Unicode code points, as JSON Schema minLength/maxLength count it.
export const ucs2length = (s: string): number => Array.from(s).length;

const DAYS = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const isLeap = (y: number) => y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0);

// Each format has the shape ajv-formats registered at generation time: `date` is an object with
// `validate` (it also has a comparator there), `uri` a plain function.
const isDate = (s: string): boolean => {
  const m = DATE.exec(s);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const max = mo === 2 && isLeap(y) ? 29 : DAYS[mo];
  return mo >= 1 && mo <= 12 && d >= 1 && d <= (max ?? 0);
};

export const formats = {
  // RFC 3339 full-date with a real day of month (same rule as ajv-formats `date`)
  date: { validate: isDate },
  // An absolute URI: scheme ":" then no whitespace or characters RFC 3986 never allows. Looser
  // than ajv-formats' full `uri` regex; tools/validate.mjs remains the strict authoring check.
  uri: (s: string): boolean => /^[a-z][a-z0-9+.-]*:[^\s"<>\\^`{|}]*$/i.test(s)
};
