// skill.js

import axios from "axios";
import { getAnswer } from '../handleUserQuestion.js'; // 새로 만든 함수를 가져옵니다.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body;
  const userInput = body.userRequest?.utterance || "";
  const callbackUrl = body.userRequest?.callbackUrl;
  const callbackToken = req.headers['x-kakao-callback-token'];

  // ✅ 카카오 버튼에서 보낼 두 가지 정보를 모두 받습니다.
  const purchaseState = body.action?.params?.purchase_state; // 예: 'before'
  const productType = body.action?.params?.product_type;   // 예: 'usim'

  console.log('[userInput]', userInput);
  console.log('[purchaseState]', purchaseState);
  console.log('[productType]', productType);

  // ... (선응답 로직은 동일) ...
  res.status(200).json({
    version: "2.0",
    useCallback: true,
    data: { text: "답변을 준비 중이에요 😊" },
  });

  try {
    // ✅ 새로 만든 함수에 두 가지 정보를 모두 전달합니다.
    const gptText = await getAnswer(userInput, purchaseState, productType);
    console.log('🟢 [GPT 응답]', gptText);

    // ... (콜백 응답 로직은 동일) ...
    await axios.post(
      callbackUrl,
      { /* ... */ },
      { /* ... */ }
    );
  } catch (error) {
    // ... (에러 처리 로직은 동일) ...
  }
}