
import axios from 'axios';
import { getAnswer } from '../handleUserQuestion.js';

export default async function handler(req, res) {
  const callbackUrl = req.body?.userRequest?.callbackUrl;

  try {
    const { userRequest } = req.body;
    const userInput = userRequest?.utterance || '';

    // 콜백 URL이 없으면 진행하지 않음
    if (!callbackUrl) {
      return res.status(400).json({ error: 'Callback URL is missing.' });
    }

    // 1. 즉시 1차 응답
    res.status(200).json({
      version: '2.0',
      useCallback: true,
    });
    
    // 2. 백그라운드 작업
    console.log(`[작업 시작] userInput: ${userInput}`);
    const gptResponse = await getAnswer(userInput);
    console.log(`[GPT 응답 수신] response: ${gptResponse}`);

    // 3. 최종 답변을 공식 가이드에 맞는 JSON 형식으로 전송
    await axios.post(callbackUrl, {
      version: '2.0',
      // 'data' 필드로 template을 한번 더 감싸줍니다.
      data: {
        template: {
          outputs: [{ simpleText: { text: gptResponse || '답변을 생성하지 못했습니다.' } }],
        }
      }
    });

  } catch (error) {
    console.error('--- 🚨 Skill.js 심각한 오류 발생 ---', error.message);
    if (callbackUrl) {
      try {
        await axios.post(callbackUrl, {
          version: '2.0',
          // 에러 응답 역시 'data' 필드로 감싸줍니다.
          data: {
            template: {
              outputs: [{ simpleText: { text: '죄송합니다. 내부 서버 오류가 발생했습니다.' } }],
            }
          }
        });
      } catch (cbError) {
        console.error('[콜백 오류 응답 전송 실패]', cbError.message);
      }
    }
  }
}