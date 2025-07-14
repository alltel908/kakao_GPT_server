import axios from "axios";
import { handleFreeQuestion } from '../handleUserQuestion.js';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body;

  const userInput = body.userRequest?.utterance || "";
  const callbackUrl = body.userRequest?.callbackUrl;

  // ✅ 헤더에서 callbackToken 가져오기 (대소문자 모두 대비)
  const callbackToken =
    req.headers['x-kakao-callback-token'] ||
    req.headers['X-Kakao-Callback-Token'] ||
    req.headers['X-KAKAO-CALLBACK-TOKEN'] ||
    '';

  // ✅ 전체 로그 출력 (디버깅용)
  console.log('🟡 [userInput]', userInput);
  console.log('🟡 [callbackUrl]', callbackUrl);
  console.log('🟡 [callbackToken]', callbackToken || '[없음]');
  console.log('🟡 [All Headers]', JSON.stringify(req.headers, null, 2));

  if (!callbackUrl) {
    return res.status(400).json({ error: "요청에 callbackUrl이 포함되지 않았습니다." });
  }

  // ✅ 선 응답 (5초 이내)
  res.status(200).json({
    version: "2.0",
    useCallback: true,
    data: { text: "답변을 준비 중이에요 😊" },
  });

  try {
    const gptText = await handleFreeQuestion(userInput);
    console.log('🟢 [GPT 응답]', gptText);

    // ✅ callbackToken이 없을 경우 경고
    if (!callbackToken) {
      console.warn('❌ [경고] callbackToken이 없어 콜백 응답이 무시될 수 있습니다.');
    }

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
          ...(callbackToken && { "X-Kakao-Callback-TOKEN": callbackToken }),
        },
      }
    );
  } catch (error) {
    console.error('🔴 [GPT 또는 콜백 에러]', error?.response?.data || error.message);

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
          ...(callbackToken && { "X-Kakao-Callback-TOKEN": callbackToken }),
        },
      }
    );
  }
}
