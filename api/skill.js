import axios from "axios";
import { handleFreeQuestion } from '../handleUserQuestion.js';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body;

  const userInput = body.userRequest?.utterance || "";
  const callbackUrl = body.userRequest?.callbackUrl;

  // ✅ 이 부분이 가장 중요합니다. 소문자 헤더에서 토큰을 가져옵니다.
  const callbackToken = req.body.userRequest?.callbackToken;

  console.log('[userInput]', userInput);
  console.log('[callbackToken]', callbackToken); // 이 로그를 꼭 확인해야 합니다.

  if (!callbackUrl) {
    return res.status(400).json({ error: "요청에 callbackUrl이 포함되지 않았습니다." });
  }

  res.status(200).json({
    version: "2.0",
    useCallback: true,
    data: { text: "답변을 준비 중이에요 😊" },
  });

  try {
    const gptText = await handleFreeQuestion(userInput);
    console.log('[GPT 응답]', gptText);

    // ✅ 콜백 응답 헤더에 토큰을 포함해서 전송합니다.
    await axios.post(
      callbackUrl,
      {
        version: "2.0",
        template: {
          outputs: [{ simpleText: { text: gptText } }],
        },
      },
      {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          "X-Kakao-Callback-TOKEN": callbackToken, // ✅ 필수
        },
      }
    );
  } catch (error) {
    console.error('[GPT 또는 콜백 에러]', error?.response?.data || error.message);

    await axios.post(
      callbackUrl,
      {
        version: "2.0",
        template: {
          outputs: [{ simpleText: { text: "죄송합니다. 응답 생성 중 문제가 발생했어요." } }],
        },
      },
      {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          "X-Kakao-Callback-TOKEN": callbackToken,
        },
      }
    );
  }
}
