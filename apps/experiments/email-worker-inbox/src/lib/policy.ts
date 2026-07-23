/**
 * Simple demo policy: reject obvious spam markers.
 */
export function shouldReject(from: string, subject: string): string | null {
  const fromLower = from.toLowerCase();
  const subjectLower = subject.toLowerCase();
  if (fromLower.includes("spam.example") || fromLower.includes("@spam.")) {
    return "Blocked sender domain";
  }
  if (subjectLower.includes("[spam]") || subjectLower.startsWith("spam:")) {
    return "Blocked spam subject";
  }
  return null;
}
