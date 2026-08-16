/**
 * AI 对话服务层
 */
import { MOCK_ENABLED } from './mock';
import { getMockAiReply } from './mock/ai.mock';
import { callCloudFunction } from './cloud';

export async function getAiReply(text: string): Promise<string> {
  if (MOCK_ENABLED) return getMockAiReply(text);
  const res = await callCloudFunction<{ reply: string }>('ai', { action: 'chat', data: { text } });
  return res.reply || '...';
}
