interface Stage1Result {
    memberId: string;
    memberName: string;
    content: string;
}
interface RankingEntry {
    position: number;
    label: string;
    memberId: string;
    memberName: string;
}
interface Stage2Result {
    memberId: string;
    memberName: string;
    rawEvaluation: string;
    parsedRanking: RankingEntry[];
}
interface AggregateRanking {
    memberId: string;
    memberName: string;
    avgPosition: number;
    voteCount: number;
}
interface CouncilOutput {
    stage1: Stage1Result[];
    stage2: Stage2Result[];
    stage3: string;
    aggregateRankings: AggregateRanking[];
    labelToModel: Record<string, string>;
}
declare function runCouncil(query: string): Promise<CouncilOutput>;
export { runCouncil };
export type { CouncilOutput, Stage1Result, Stage2Result, AggregateRanking };
//# sourceMappingURL=council.d.ts.map