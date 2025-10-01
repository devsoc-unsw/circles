/**
 * Converts a manageability score into a difficulty rating.
 * Example: lower manageability → higher difficulty.
 * @param manageability number from 0 to 5
 * @returns difficulty rating
 */
export default function getDifficultyRating(manageability: number): string {
  if (manageability < 2) {
    return 'Challenging';
  }

  if (manageability >= 2 && manageability < 4) {
    return 'Manageable';
  }

  return 'Easy';
}
