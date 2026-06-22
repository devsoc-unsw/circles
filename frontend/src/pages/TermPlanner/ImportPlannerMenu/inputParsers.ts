import pdfToText from 'react-pdftotext';
import { JSONPlanner, PlannerYear } from 'types/planner';

const parseAcademicStatement = async (pdf: File): Promise<JSONPlanner> => {
  const text = await pdfToText(pdf);
  const prizeIdx = text.search(/Prizes/i);
  const mainText = prizeIdx >= 0 ? text.slice(0, prizeIdx) : text;

  const termHeader = /Term\s*(\d)\s*(\d{4})/g;
  type TermInfo = { term: number; year: number; idx: number };
  const headers: TermInfo[] = [];
  let hm: RegExpExecArray | null = termHeader.exec(mainText);

  while (hm !== null) {
    headers.push({
      term: parseInt(hm[1], 10),
      year: parseInt(hm[2], 10),
      idx: hm.index
    });
    hm = termHeader.exec(mainText);
  }
  if (headers.length === 0) {
    throw new Error('No “Term <…> <YYYY>” found');
  }

  headers.sort((a, b) => a.idx - b.idx);
  type Segment = { term: number; year: number; content: string };
  const segments: Segment[] = [];
  for (let i = 0; i < headers.length; ++i) {
    const start = headers[i].idx;
    const end = i + 1 < headers.length ? headers[i + 1].idx : mainText.length;
    segments.push({
      term: headers[i].term,
      year: headers[i].year,
      content: mainText.slice(start, end)
    });
  }

  const yearMap = new Map<number, PlannerYear>();
  const codeRx = /\b([A-Z]{4})\s*(\d{4})\b/g;
  const failRx = /\b(?:AF|AW|CN|FL|NC|UF)\b/;

  segments.forEach(({ term, year, content }) => {
    if (!yearMap.has(year)) {
      yearMap.set(year, { T0: [], T1: [], T2: [], T3: [] });
    }
    const maybePy = yearMap.get(year);
    if (!maybePy) {
      throw new Error(`PlannerYear for year ${year} not found`);
    }
    const py = maybePy;

    const scanBlock = content.split(/Transfer Credit/i)[0];
    const slot = `T${term}` as keyof PlannerYear;

    Array.from(scanBlock.matchAll(codeRx))
      .map((m) => {
        const code = `${m[1]}${m[2]}`;
        const idx = m.index ?? 0;
        const start = scanBlock.lastIndexOf('\n', idx) + 1;
        const end = scanBlock.indexOf('\n', idx);
        const line = scanBlock.slice(start, end === -1 ? scanBlock.length : end);
        return { code, line };
      })
      .filter(({ line }) => !failRx.test(line))
      .forEach(({ code }) => {
        if (!py[slot].includes(code)) {
          py[slot].push(code);
        }
      });
  });

  const yearsSorted = Array.from(yearMap.keys()).sort((a, b) => a - b);
  const years = yearsSorted.map((y) => yearMap.get(y) as PlannerYear);

  return {
    startYear: yearsSorted[0],
    numYears: yearsSorted.length,
    isSummerEnabled: years.some((py) => py.T0.length > 0),
    years,
    version: 1
  };
};

export default parseAcademicStatement;
