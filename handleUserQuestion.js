import OpenAI from 'openai';
import { callGPTWithFAQ_esim } from './gpt/callGPTWithFAQ_esim.js';
import { callGPTWithFAQ_usim } from './gpt/callGPTWithFAQ_usim.js';
import { callGPTWithFAQ_wifi } from './gpt/callGPTWithFAQ_wifi.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function handleUserQuestion(userInput) {
  const classification = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `고객 질문을 보고 적절한 카테고리를 판단하세요. 가능한 값: esim, usim, wifi. 설명 없이 카테고리만 답하세요.`
      },
      {
        role: 'user',
        content: userInput
      }
    ]
  });

  const category = classification.choices[0].message.content.trim().toLowerCase();

  switch (category) {
    case 'esim':
      return await callGPTWithFAQ_esim(userInput);
    case 'usim':
      return await callGPTWithFAQ_usim(userInput);
    case 'wifi':
      return await callGPTWithFAQ_wifi(userInput);
    default:
      return '죄송합니다. 질문을 이해했지만 카테고리를 분류하지 못했어요.';
  }
}

