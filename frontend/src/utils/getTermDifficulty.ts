export default function getTermDifficulty(manageabilities: string[]): string {
  const numCourses = manageabilities.length;
  if (numCourses === 0) {
    return 'Unknown';
  }

  const diffSum = manageabilities.reduce((sum, curr) => sum + (5 - +curr), 0).toFixed(1);

  return diffSum;
  // return 'Easy';
}
