"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrustCalculator = void 0;
class TrustCalculator {
    /**
     * Calculates the overall trust score based on individual confidence factors.
     * Weightings:
     * - Github Evidence (Does the code match the claims?): 40%
     * - Resume Consistency (Are the dates/skills internally consistent?): 25%
     * - Contribution Confidence (Are they actually writing the code?): 20%
     * - Activity Confidence (Is the commit history realistic?): 15%
     */
    calculateOverallScore(scores) {
        const weightedScore = Math.round((scores.githubEvidence * 0.40) +
            (scores.resumeConsistency * 0.25) +
            (scores.contributionConfidence * 0.20) +
            (scores.activityConfidence * 0.15));
        let finalScore = weightedScore;
        // Hard Penalty: If certificates look heavily tampered with, deduct 20 points.
        if (scores.certificateValidity < 50) {
            finalScore = Math.max(0, finalScore - 20);
        }
        return {
            ...scores,
            overallScore: finalScore
        };
    }
}
exports.TrustCalculator = TrustCalculator;
//# sourceMappingURL=trust-calculator.js.map