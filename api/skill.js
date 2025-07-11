// /api/skill.js

import axios from "axios";
import { handleUserQuestion } from "../handleUserQuestion.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const userInput = req.body?.userRequest?.utterance || "";
    const callbackUrl = req.body?.userRequest?.callbackUrl;
    const callbackToken = req.headers['x-kakao-callback-token'];
    const category = req.body?.action?.params?.category || 'usim';

    // ✅ fallback 처리: Postman 등 callbackUrl 없는 경우
    if (!callbackUrl) {
      console.log("🟡 fallback 모드: callbackUrl 없음");
      const result = await handleUserQuestion(userInput, category);

      const replyText = typeof result === "string" ? result : result?.answer || "답변이 비어있습니다.";

      return res.status(200).json({
        version: "2.0",
        template: {
          outputs: [
            {
              simpleText: {
                text: replyText
              }
            }
          ]
        }
      });
    }

    // ✅ callback 구조: 오픈빌더에서 호출한 경우
    console.log("🟢 callback 모드: callbackUrl 있음");
    res.status(200).json({
      version: "2.0",
      useCallback: true,
      data: { text: "답변을 준비 중이에요 😊" }
    });

    const result = await handleUserQuestion(userInput, category);
    const replyText = typeof result === "string" ? result : result?.answer || "답변이 비어있습니다.";

    await axios.post(callbackUrl, {
      version: "2.0",
      template: {
        outputs: [
          {
            simpleText: {
              text: replyText
            }
          }
        ]
      }
    }, {
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'X-Kakao-Callback-TOKEN': callbackToken
      }
    });

  } catch (error) {
    console.error("❌ skill.js 오류:", error?.response?.data || error.message);

    // 콜백이 있으면 에러 응답도 callback으로 전송
    if (req.body?.userRequest?.callbackUrl) {
      await axios.post(req.body.userRequest.callbackUrl, {
        version: "2.0",
        template: {
          outputs: [
            {
              simpleText: {
                text: "죄송합니다. GPT 응답에 문제가 생겼어요."
              }
            }
          ]
        }
      }, {
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'X-Kakao-Callback-TOKEN': req.headers['x-kakao-callback-token']
        }
      });
    } else {
      // fallback 모드일 경우 에러 응답
      res.status(500).json({
        version: "2.0",
        template: {
          outputs: [
            {
              simpleText: {
                text: "서버 오류가 발생했어요. 다시 시도해 주세요."
              }
            }
          ]
        }
      });
    }
  }
}
