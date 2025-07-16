import { getAnswer } from '../handleUserQuestion.js';
import axios from 'axios';

export default async function handler(req, res) {
  // 요청 본문을 미리 변수에 저장
  const body = req.body;
  const callbackUrl = body?.userRequest?.callbackUrl;

  try {
    console.log('--- [1] Skill 핸들러 시작 ---');

    // 1. 콜백 URL이 없으면 에러 처리
    if (!callbackUrl) {
      console.log('[오류] 콜백 URL이 없습니다.');
      return res.status(400).json({ error: 'Callback URL is missing.' });
    }

    // 2. "네, 접수했습니다" 라는 1차 응답을 즉시 보냅니다.
    console.log('--- [2] 1차 응답(useCallback) 즉시 전송 ---');
    res.status(200).json({
      version: '2.0',
      useCallback: true,
    });

    // --- (이제부터는 백그라운드에서 여유롭게 작업 수행) ---

    // 3. 사용자 질문을 추출하고 GPT에게 답변을 요청합니다.
    const userInput = body?.userRequest?.utterance || '질문 없음';
    console.log(`--- [3] 백그라운드 작업 시작 (입력: ${userInput}) ---`);
    const answer = await getAnswer(userInput);
    console.log('--- [4] GPT 응답 수신 완료 ---');

    // 4. 최종 답변을 카카오의 콜백 주소로 전송합니다.
    console.log('--- [5] 2차 응답(최종 답변) 전송 시작 ---');
    await axios.post(callbackUrl, {
      version: '2.0',
      template: {
        outputs: [
          {
            simpleText: {
              text: answer || '죄송합니다. 답변을 생성하지 못했습니다.',
            },
          },
        ],
      },
    });
    console.log('--- [6] 2차 응답 전송 완료 ---');

  } catch (error) {
    console.error('[❗ skill.js 오류]', error.message);

    // 에러 발생 시에도 콜백으로 사용자에게 알려줍니다.
    if (callbackUrl) {
      try {
        await axios.post(callbackUrl, {
          version: '2.0',
          template: {
            outputs: [
              {
                simpleText: {
                  text: '죄송합니다. 답변 처리 중 오류가 발생했습니다.',
                },
              },
            ],
          },
        });
      } catch (cbError) {
        console.error('[콜백 오류 응답 전송 실패]', cbError.message);
      }
    }
  }
}
