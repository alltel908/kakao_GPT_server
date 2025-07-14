import axios from "axios";
import { getAnswer } from '../handleUserQuestion.js';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body;

  // ✅ 포스트맨 요청 판단
  if (!body.userRequest) {
    const { userInput, purchase_state, product_type } = body;

    if (!userInput || !purchase_state || !product_type) {
      return res.status(400).json({ error: 'Missing required fields for test' });
    }

    const answer = await getAnswer(userInput, purchase_state, product_type);

    return res.status(200).json({
      testMode: true,
      input: userInput,
      purchase_state,
      product_type,
      answer,
    });
  }

  // ✅ 오픈빌더 요청 처리
  const userInput = body.userRequest?.utterance || "";
  const callbackUrl = body.userRequest?.callbackUrl;
  const callbackToken = req.headers['x-kakao-callback-token'];

  const purchaseState = body.action?.params?.purchase_state;
  const productType = body.action?.params?.product_type;

  console.log('[userInput]', userInput);
  console.log('[purchaseState]', purchaseState);
  console.log('[productType]', productType);

  // 선 응답
  res.status(200).json({
    version: "2.0",
    useCallback: true,
    data: { text: "답변을 준비 중이에요 😊" },
  });

  try {
    const gptText = await getAnswer(userInput, purchaseState, productType);
    console.log('🟢 [GPT 응답]', gptText);

    await axios.post(
      callbackUrl,
      {
        version: "2.0",
        useCallback: true,
        data: { text: gptText },
      },
      {
        headers: {
          Authorization: `Bearer ${callbackToken}`,
        },
      }
    );
  } catch (error) {
    console.error("[❌ 콜백 실패]", error);
  }
}
