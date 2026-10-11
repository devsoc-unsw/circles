// The progression checker, rendered by the degree evaluator (VITE_DEGREE_EVAL=true), for a guest
// on 3778 + COMPA1 with a full 144 UOC plan. The user is seeded through the existing API: a guest
// login, then PUT /user/import with the whole degree, planner and courses.
import { expect, test } from '@playwright/test';

const api = (process.env.E2E_API_URL ?? 'http://localhost:8000/').replace(/\/$/, '');

// the plan of evaluateProgression.test.ts, with GENL1063 for GENL2020 (not in the backend's data)
const TERMS = [
  ['COMP1511', 'MATH1131', 'MATH1081'],
  ['COMP1521', 'MATH1231', 'ECON1101'],
  ['COMP1531', 'COMP2521', 'MATH2011'],
  ['COMP2511', 'MATH2501', 'ARTS1090'],
  ['COMP3121', 'COMP3311', 'MATH2121'],
  ['COMP3331', 'MATH3411', 'GENL1062'],
  ['COMP3900', 'COMP6080', 'GENL1063'],
  ['COMP4920', 'COMP6441', 'COMP9417']
];

const user = {
  degree: { programCode: '3778', specs: ['COMPA1'] },
  planner: {
    unplanned: [],
    startYear: 2026,
    isSummerEnabled: false,
    lockedTerms: {},
    years: [0, 1, 2].map((y) => ({
      T0: [],
      T1: TERMS[y * 3] ?? [],
      T2: TERMS[y * 3 + 1] ?? [],
      T3: TERMS[y * 3 + 2] ?? []
    }))
  },
  // the first term is completed
  courses: Object.fromEntries(
    TERMS.flat().map((code, i) => [code, { mark: i < 3 ? 75 : null, ignoreFromProgression: false }])
  ),
  settings: { showMarks: false, hiddenYears: [] }
};

test('progression checker renders 3778 + COMPA1 from the degree evaluator', async ({ page }) => {
  // the refresh cookie set here is shared with the page, which restores the session from it
  const login = await page.request.post(`${api}/auth/guest_login`);
  expect(login.ok(), await login.text()).toBe(true);
  const { session_token: token } = (await login.json()) as { session_token: string };

  const seeded = await page.request.put(`${api}/user/import`, {
    headers: { Authorization: `Bearer ${token}` },
    data: user
  });
  expect(seeded.ok(), await seeded.text()).toBe(true);

  await page.goto('/progression-checker');

  // the banner summarises the evaluator's verdict
  await expect(page.getByText('132 of 144 UOC counted', { exact: false })).toBeVisible({
    timeout: 30_000
  });

  // the major is its own group, and its core lists a planned course
  await expect(page.getByRole('heading', { name: /^COMPA1/ })).toBeVisible();
  await expect(page.getByText('COMP1511').first()).toBeVisible();

  // the 36 UOC free-elective pool is full, so two more non-major courses count towards nothing
  await expect(page.getByRole('heading', { name: 'Not Counted' })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: /12 UOC worth of courses that count towards no requirement/ })
  ).toBeVisible();
  await expect(page.getByRole('button', { name: /^MATH3411:/ }).last()).toBeVisible();
  await expect(page.getByRole('button', { name: /^GENL1063:/ })).toBeVisible();
  // the legacy "Free Electives" overflow section is replaced
  await expect(
    page.getByText('These courses may or may not be counted', { exact: false })
  ).toHaveCount(0);
});
