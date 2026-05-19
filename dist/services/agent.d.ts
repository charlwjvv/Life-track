interface AgentResponse {
    text: string;
    tokens?: number;
    cost?: number;
}
declare function spawnAgent(systemPrompt: string, userPrompt: string, timeoutMs?: number): Promise<AgentResponse>;
export { spawnAgent };
export type { AgentResponse };
//# sourceMappingURL=agent.d.ts.map