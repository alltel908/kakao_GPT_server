import axios from "axios";
import { handleFreeQuestion } from '../handleUserQuestion.js';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body;

  const userInput = body.userRequest?.utterance || "";
  const callbackUrl = body.userRequest?.callbackUrl;
  const callbackToken = req.headers['x-kakao-callback-token']; // ✅ 핵심 수정

  console.log('[userInput]', userInput);
  console.log('[callbackUrl]', callbackUrl);
  console.log('[callbackToken]', callbackToken);

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
          "X-Kakao-Callback-TOKEN": callbackToken,
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
