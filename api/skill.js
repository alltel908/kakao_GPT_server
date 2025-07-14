// skill.js

import axios from "axios";
// ✅ 수정한 handleUserQuestion.js에서 새로운 함수를 가져옵니다.
import { getAnswerByCategory } from '../handleUserQuestion.js'; 

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body;
  const userInput = body.userRequest?.utterance || "";
  const callbackUrl = body.userRequest?.callbackUrl;
  const callbackToken = req.headers['x-kakao-callback-token'];

  // 👇 카카오 버튼에서 보낸 카테고리 정보를 여기서 받습니다.
  const category = body.action?.params?.category;

  console.log('[userInput]', userInput);
  console.log('[category]', category); // 카테고리가 잘 들어오는지 로그 추가

  // ... (선응답 로직은 동일) ...
  res.status(200).json({
    version: "2.0",
    useCallback: true,
    data: { text: "답변을 준비 중이에요 😊" },
  });

  try {
    // 👇 수정한 함수를 호출하고, userInput과 category를 모두 전달합니다.
    const gptText = await getAnswerByCategory(userInput, category);
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