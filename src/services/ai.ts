/**
 * AI 对话服务层
 */
import type { PetAiContext } from '@/types';
import { MOCK_ENABLED } from './mock';
import { getMockAiReply } from './mock/ai.mock';
import { callCloudFunction } from './cloud';

export async function getAiReply(text: string, context?: PetAiContext): Promise<string> {
  if (MOCK_ENABLED) return getMockAiReply(text, context);
  const res = await callCloudFunction<{ reply: string }>('ai', {
    action: 'chat',
    data: { text, context },
  });
  return res.reply || '...';
}
