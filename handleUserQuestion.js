import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getAnswer(userInput) {
  const res = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: '당신은 친절한 고객센터 챗봇입니다.' },
      { role: 'user', content: userInput },
    ],
  });

  return res.choices[0]?.message?.content?.trim();
}
