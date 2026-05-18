import { spawn } from 'child_process';

interface AgentResponse {
  text: string;
  tokens?: number;
  cost?: number;
}

let running = 0;
const queue: Array<() => void> = [];

function next() {
  running--;
  const next_ = queue.shift();
  if (next_) next_();
}

async function spawnAgent(
  systemPrompt: string,
  userPrompt: string,
  timeoutMs = 60000
): Promise<AgentResponse> {
  return new Promise((resolve, reject) => {
    const enqueue = () => {
      const fullPrompt = systemPrompt
        ? `${systemPrompt}\n\n---\n\n${userPrompt}`
        : userPrompt;

      running++;
      const proc = spawn('opencode', ['run', fullPrompt, '--format', 'json'], {
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      let stdout = '';
      proc.stdout?.on('data', (d) => { stdout += d.toString(); });

      const timer = setTimeout(() => {
        proc.kill('SIGTERM');
        reject(new Error(`Agent timed out after ${timeoutMs}ms`));
        next();
      }, timeoutMs);

      proc.on('close', (code) => {
        clearTimeout(timer);
        next();
        if (code === 0 && stdout.trim()) {
          let finalText = '';
          for (const line of stdout.split('\n')) {
            if (!line.trim()) continue;
            try {
              const event = JSON.parse(line);
              if (event.type === 'text' && event.part?.text) {
                finalText += event.part.text;
              }
            } catch { /* skip */ }
          }
          if (finalText.trim()) {
            resolve({ text: finalText.trim() });
          } else {
            reject(new Error(`Agent exit ${code}: no text output`));
          }
        } else {
          reject(new Error(`Agent exited with code ${code}`));
        }
      });

      proc.on('error', (err) => {
        clearTimeout(timer);
        next();
        reject(new Error(`Spawn error: ${err.message}`));
      });
    };

    if (running < 2) {
      enqueue();
    } else {
      queue.push(enqueue);
    }
  });
}

export { spawnAgent };
export type { AgentResponse };