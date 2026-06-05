import { TrustScoreBreakdown } from '../../../shared-types/src/index';
export declare class TrustCalculator {
    /**
     * Calculates the overall trust score based on individual confidence factors.
     * Weightings:
     * - Github Evidence (Does the code match the claims?): 40%
     * - Resume Consistency (Are the dates/skills internally consistent?): 25%
     * - Contribution Confidence (Are they actually writing the code?): 20%
     * - Activity Confidence (Is the commit history realistic?): 15%
     */
    calculateOverallScore(scores: Omit<TrustScoreBreakdown, 'overallScore'>): TrustScoreBreakdown;
}
//# sourceMappingURL=trust-calculator.d.ts.map