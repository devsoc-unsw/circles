/**
 * Converts a manageability score into a difficulty rating.
 * where: lower manageability → higher difficulty.
 * @param totalManageability number from 0 to 5
 * @returns difficulty rating
 */
export default function getDifficultyRating(totalManageability: number): string {
  return totalManageability.toFixed(1);
}
