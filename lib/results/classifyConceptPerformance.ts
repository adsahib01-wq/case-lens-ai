import { CombinedConceptPerformance, ConceptClassification } from "./types";

export function classifyConceptPerformance(
  performance: CombinedConceptPerformance,
  allAttemptsChronological: { isCorrect: boolean; confidence?: string }[]
): ConceptClassification {
  const { totalAnswered, accuracyPercentage, highConfidenceErrorCount, errorCount } = performance;

  // 1. Insufficient evidence
  if (totalAnswered < 2) {
    return "insufficient-evidence";
  }

  // Calculate error rate
  const errorRate = errorCount / totalAnswered;

  // For improving concept logic, we need to inspect the timeline
  let isImproving = false;
  if (totalAnswered >= 4 && allAttemptsChronological.length >= 4) {
    const latest3 = allAttemptsChronological.slice(-3);
    const earlier = allAttemptsChronological.slice(0, -3);

    const earlierErrors = earlier.filter(a => !a.isCorrect).length;
    const latest3Correct = latest3.filter(a => a.isCorrect).length;
    
    const earlierAccuracy = (earlier.length - earlierErrors) / earlier.length;
    const recentAccuracy = latest3Correct / 3;

    if (earlierErrors >= 2 && latest3Correct >= 2 && recentAccuracy > earlierAccuracy) {
      isImproving = true;
    }
  }

  // 2. Improving concept
  if (isImproving) {
    return "improving-concept";
  }

  // 3. Consistent weakness
  if (totalAnswered >= 5) {
    if (accuracyPercentage < 50 || (highConfidenceErrorCount >= 2 && errorRate >= 0.4)) {
      return "consistent-weakness";
    }
  }

  // 4. Emerging weakness
  if (totalAnswered >= 3) {
    const latest3 = allAttemptsChronological.slice(-3);
    const latest3Errors = latest3.filter(a => !a.isCorrect).length;
    
    if (accuracyPercentage < 60 || latest3Errors >= 2) {
      return "emerging-weakness";
    }
  }

  // 5. Possible weakness
  if (totalAnswered >= 2 && errorCount >= 1) {
    return "possible-weakness";
  }

  // 6. Strong concept
  if (totalAnswered >= 5) {
    const latest3 = allAttemptsChronological.slice(-3);
    const latest3Correct = latest3.filter(a => a.isCorrect).length;

    if (accuracyPercentage >= 80 && latest3Correct === 3 && highConfidenceErrorCount <= 1) {
      return "strong-concept";
    }
  }

  // 7. Developing / mixed evidence
  return "developing-mixed-evidence";
}
