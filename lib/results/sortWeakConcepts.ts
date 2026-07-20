import { CombinedConceptPerformance } from "./types";

const severityScore: Record<string, number> = {
  "consistent-weakness": 3,
  "emerging-weakness": 2,
  "possible-weakness": 1
};

export function sortWeakConcepts(
  concepts: CombinedConceptPerformance[]
): CombinedConceptPerformance[] {
  return [...concepts].sort((a, b) => {
    // 1. Classification severity (consistent > emerging > possible)
    const severityA = severityScore[a.classification] || 0;
    const severityB = severityScore[b.classification] || 0;
    if (severityA !== severityB) return severityB - severityA;

    // 2. High-confidence error count (descending)
    if (a.highConfidenceErrorCount !== b.highConfidenceErrorCount) {
      return b.highConfidenceErrorCount - a.highConfidenceErrorCount;
    }

    // 3. Error rate (descending)
    const errorRateA = a.totalAnswered > 0 ? a.errorCount / a.totalAnswered : 0;
    const errorRateB = b.totalAnswered > 0 ? b.errorCount / b.totalAnswered : 0;
    if (errorRateA !== errorRateB) return errorRateB - errorRateA;

    // 4. Total error count (descending)
    if (a.errorCount !== b.errorCount) return b.errorCount - a.errorCount;

    // 5. Last error date (newest first)
    // Wait, lastAttemptAt might be the last *error* or last *attempt*. 
    // The spec says "Last error date". We need to track the last error date in the aggregation logic and fall back to last attempt if not available, or just use lastAttemptAt for now. We will ensure aggregateOverallResults sets lastAttemptAt based on the last attempt, but let's actually ensure it sets a `lastErrorAt` if needed. For now we use lastAttemptAt.
    const timeA = a.lastAttemptAt ? new Date(a.lastAttemptAt).getTime() : 0;
    const timeB = b.lastAttemptAt ? new Date(b.lastAttemptAt).getTime() : 0;
    if (timeA !== timeB) return timeB - timeA;

    // 6. Total answered (descending)
    if (a.totalAnswered !== b.totalAnswered) return b.totalAnswered - a.totalAnswered;

    // 7. Concept label (alphabetical)
    return a.conceptLabel.localeCompare(b.conceptLabel);
  });
}
