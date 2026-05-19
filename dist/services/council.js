"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCouncil = runCouncil;
const agent_1 = require("./agent");
const COUNCIL_MEMBERS = [
    {
        id: 'agent-1',
        name: 'Socratic',
        persona: 'You are Socratic — a philosopher who questions everything, finds contradictions, and guides through inquiry. Be concise but probing.',
    },
    {
        id: 'agent-2',
        name: 'Pragmatist',
        persona: 'You are the Pragmatist — focused on what works, real-world tradeoffs, costs, and implementation realities. Be direct.',
    },
    {
        id: 'agent-3',
        name: 'Visionary',
        persona: 'You are the Visionary — thinks long-term, sees the bigger picture, challenges assumptions and pushes boundaries. Be bold.',
    },
];
const EVALUATOR = {
    id: 'agent-4',
    name: 'Arbiter',
    persona: 'You are the Arbiter — fair, rigorous, analytical. You evaluate arguments on logic, evidence, and depth. Follow output format exactly.',
};
const CHAIRMAN = {
    id: 'agent-5',
    name: 'Chairman',
    persona: 'You are the Chairman — synthesizing multiple perspectives into a clear, confident verdict. Draw from the best insights.',
};
function parseRanking(text, labelToMember) {
    const finalSection = text.split('FINAL RANKING:').pop() || text;
    const lines = finalSection.split('\n').filter(Boolean);
    const ranked = [];
    for (const line of lines) {
        const match = line.match(/^\s*(\d+)\.\s*Response\s+([A-Z])/i);
        if (match) {
            const label = `Response ${match[2].toUpperCase()}`;
            const member = labelToMember[match[2].toUpperCase()];
            ranked.push({
                position: parseInt(match[1]),
                label,
                memberId: member?.memberId ?? '',
                memberName: member?.memberName ?? label,
            });
        }
    }
    return ranked;
}
function calculateAggregate(s2) {
    const totals = {};
    for (const result of s2) {
        for (const entry of result.parsedRanking) {
            if (!totals[entry.memberId])
                totals[entry.memberId] = { sum: 0, count: 0 };
            totals[entry.memberId].sum += entry.position;
            totals[entry.memberId].count += 1;
        }
    }
    return Object.entries(totals)
        .map(([id, { sum, count }]) => ({
        memberId: id,
        memberName: COUNCIL_MEMBERS.find((m) => m.id === id)?.name ?? id,
        avgPosition: parseFloat((sum / count).toFixed(2)),
        voteCount: count,
    }))
        .sort((a, b) => a.avgPosition - b.avgPosition);
}
async function stage1(query) {
    const results = await Promise.allSettled(COUNCIL_MEMBERS.map((m) => (0, agent_1.spawnAgent)(m.persona, query).then((r) => ({
        memberId: m.id,
        memberName: m.name,
        content: r.text,
    }))));
    return results
        .filter((r) => r.status === 'fulfilled')
        .map((r) => r.value);
}
async function stage2(query, s1) {
    const labels = s1.map((_, i) => String.fromCharCode(65 + i));
    const responses = s1.map((r, i) => `${labels[i]}:\n${r.content}`).join('\n\n');
    const labelToMember = {};
    for (let i = 0; i < s1.length; i++)
        labelToMember[labels[i]] = s1[i];
    const evalPrompt = `You are evaluating responses to the following question:\n\n"${query}"\n\nBelow are responses from three different agents. Evaluate each on accuracy, depth, and insightfulness. Then rank them from best (1) to worst.\n\n${responses}\n\nProvide your evaluation:\n1. Brief analysis of each response\n2. A "FINAL RANKING:" header\n3. Numbered list: "1. Response X", "2. Response Y", etc.\n4. No additional text after the ranking`;
    const evalText = (await (0, agent_1.spawnAgent)(EVALUATOR.persona, evalPrompt)).text;
    const parsed = parseRanking(evalText, labelToMember);
    return [{
            memberId: EVALUATOR.id,
            memberName: EVALUATOR.name,
            rawEvaluation: evalText,
            parsedRanking: parsed,
        }];
}
async function stage3(query, s1, aggregate) {
    const context = s1.map((r) => `[${r.memberName}]: ${r.content}`).join('\n\n');
    const rankingsText = aggregate.map((r, i) => `${i + 1}. ${r.memberName} (avg rank: ${r.avgPosition})`).join('\n');
    const prompt = `You are the Chairman synthesizing a council deliberation.\n\nQuestion: "${query}"\n\nIndividual responses:\n${context}\n\nPeer evaluation:\n${rankingsText}\n\nProvide the final synthesized answer, drawing from the best insights. Be direct and authoritative.`;
    return (await (0, agent_1.spawnAgent)(CHAIRMAN.persona, prompt)).text;
}
async function runCouncil(query) {
    const s1 = await stage1(query);
    if (s1.length === 0)
        throw new Error('No responses from council');
    const labels = s1.map((_, i) => String.fromCharCode(65 + i));
    const labelToModel = {};
    for (let i = 0; i < s1.length; i++)
        labelToModel[labels[i]] = s1[i].memberName;
    const s2 = await stage2(query, s1);
    const aggregate = calculateAggregate(s2);
    const s3 = await stage3(query, s1, aggregate);
    return { stage1: s1, stage2: s2, stage3: s3, aggregateRankings: aggregate, labelToModel };
}
//# sourceMappingURL=council.js.map