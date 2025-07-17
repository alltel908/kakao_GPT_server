import { waitUntil } from '@vercel/functions';
import { classifyProduct } from '../utils/classify.js';
import { getGptExpert } from '../gpt/index.js';

async function sendFinalResponse(callbackUrl, utterance) {
  const functionName = 'sendFinalResponse';
  try {
    console.log(`[${functionName}] INFO: Starting task for utterance: "${utterance}"`);

    // 1. 사용자 질문을 '분류'하여 어떤 상품에 대한 것인지 파악
    const productType = classifyProduct(utterance);
    console.log(`[${functionName}] INFO: Classified product type as: "${productType}"`);

    // 2. 분류된 상품에 맞는 '전문가' 함수를 가져옴
    const gptExpert = getGptExpert(productType);

    if (!gptExpert) {
      throw new Error(`No expert found for product type: ${productType}`);
    }

    // 3. 해당 전문가에게 질문을 넘겨 답변 생성
    const gptAnswer = await gptExpert(utterance);
    console.log(`[${functionName}] INFO: GPT expert response received.`);

    if (!gptAnswer) {
      throw new Error("GPT expert returned an empty answer.");
    }
    
    // 4. 최종 답변을 카카오로 전송 (이하 로직은 동일)
    const finalPayload = {
      version: "2.0",
      template: {
        outputs: [{ simpleText: { text: gptAnswer } }],
      },
    };

    const response = await fetch(callbackUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(finalPayload),
      signal: AbortSignal.timeout(8000)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Kakao server rejected the request. Status: ${response.status}, Body: ${errorText}`);
    }

    console.log(`[${functionName}] SUCCESS: Final callback sent and acknowledged by Kakao.`);

  } catch (error) {
    console.error(`[${functionName}] ERROR: Background task failed.`, error);
  }
}

// 메인 핸들러
export default function handler(req, res) {
  const callbackUrl = req.body?.userRequest?.callbackUrl;
  const utterance = req.body?.userRequest?.utterance;

  if (!callbackUrl) {
    return res.status(400).json({ error: "No callbackUrl provided" });
  }

  waitUntil(sendFinalResponse(callbackUrl, utterance));
  console.log('[handler] INFO: Background task enqueued with waitUntil.');

  res.status(200).json({
    version: "2.0",
    useCallback: true
  });
  console.log('[handler] INFO: Initial response with useCallback:true sent.');
}