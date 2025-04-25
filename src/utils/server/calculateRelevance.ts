// ! Calculates a weighted score combining Fuse.js + trendiness + freshness
export default function calculateRelevance(baseScore: number, trendScore = 0, searchScore = 0, createdAt?: Date): number {
    const timeDecay = createdAt ? (1 / ((Date.now() - new Date(createdAt).getTime()) / (1000 * 3600 * 24) + 1)) : 1;
    return (1 - baseScore) * 0.6 + (trendScore + searchScore) * 0.3 + timeDecay * 0.1;
}