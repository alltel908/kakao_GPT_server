import { waitUntil } from '@vercel/functions';
import { OpenAI } from 'openai';

// OpenAI 클라이언트 초기화
// Vercel 환경 변수에 등록된 API 키를 사용합니다.
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * 백그라운드에서 GPT 답변을 생성하고 카카오로 최종 응답을 보냅니다.
 * @param {string} callbackUrl - 카카오 서버가 응답을 받을 URL
 * @param {string} utterance - 사용자의 발화 내용
 */
async function sendFinalResponse(callbackUrl, utterance) {
  const functionName = 'sendFinalResponse';
  try {
    console.log(`[${functionName}] INFO: Starting GPT task for utterance: "${utterance}"`);

    // 1. 실제 GPT API 호출
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { "role": "system", "content": "You are a helpful assistant." },
        { "role": "user", "content": utterance }
      ],
    });

    const gptAnswer = chatCompletion.choices[0].message.content?.trim();

    if (!gptAnswer) {
      throw new Error("GPT returned an empty answer.");
    }
    console.log(`[${functionName}] INFO: GPT response received.`);

    // 2. 카카오 표준 답변 포맷으로 페이로드 구성
    const finalPayload = {
      version: "2.0",
      template: {
        outputs: [
          {
            simpleText: {
              text: gptAnswer
            }
          }
        ]
      }
    };

    // 3. 최종 답변을 카카오 콜백 URL로 전송
    const response = await fetch(callbackUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(finalPayload),
      signal: AbortSignal.timeout(8000) // 8초 타임아웃
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Kakao server rejected the request. Status: ${response.status}, Body: ${errorText}`);
    }

    console.log(`[${functionName}] SUCCESS: Final callback sent and acknowledged by Kakao with status ${response.status}`);

  } catch (error) {
    console.error(`[${functionName}] ERROR: Background task failed.`, error);
    // (선택) 에러 발생 시 사용자에게 보낼 메시지를 여기에 구현할 수 있습니다.
  }
}

/**
 * 메인 핸들러: 카카오 서버의 첫 요청을 받는 부분입니다.
 */
export default function handler(req, res) {
  const callbackUrl = req.body?.userRequest?.callbackUrl;
  const utterance = req.body?.userRequest?.utterance;

  if (!callbackUrl) {
    return res.status(400).json({ error: "No callbackUrl provided" });
  }

  // Vercel에 백그라운드 작업 등록
  waitUntil(sendFinalResponse(callbackUrl, utterance));
  console.log('[handler] INFO: Background task enqueued with waitUntil.');

  // 카카오에 즉시 초기 응답 전송
  res.status(200).json({
    version: "2.0",
    useCallback: true
  });
  console.log('[handler] INFO: Initial response with useCallback:true sent.');
}