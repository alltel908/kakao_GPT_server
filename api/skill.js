// skill.js

import axios from "axios";
import { getAnswer } from "../handleUserQuestion.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body;
  const userInput = body.userRequest?.utterance || "";
  const callbackUrl = body.userRequest?.callbackUrl;
  const callbackToken = req.headers["x-kakao-callback-token"];

  // ✅ [수정된 부분] context에서 파라미터 추출
  const contextParams = body.contexts?.[0]?.params || {};
  const purchaseState = contextParams.purchase_state;
  const productType = contextParams.product_type;

  console.log("[userInput]", userInput);
  console.log("[purchaseState]", purchaseState);
  console.log("[productType]", productType);

  // ✅ 카카오 선응답
  res.status(200).json({
    version: "2.0",
    useCallback: true,
    data: { text: "답변을 준비 중이에요 😊" },
  });

  try {
    // ✅ GPT 응답 생성
    const gptText = await getAnswer(userInput, purchaseState, productType);
    console.log("🟢 [GPT 응답]", gptText);

    // ✅ 후처리 응답 전달
    await axios.post(
      callbackUrl,
      {
        version: "2.0",
        template: {
          outputs: [
            {
              simpleText: {
                text: gptText,
              },
            },
          ],
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `KakaoAK ${callbackToken}`,
        },
      }
    );
  } catch (error) {
    console.error("❗ [GPT 응답 실패]", error.message);

    await axios.post(
      callbackUrl,
      {
        version: "2.0",
        template: {
          outputs: [
            {
              simpleText: {
                text: "죄송합니다. GPT 응답 중 오류가 발생했어요. 다시 시도해 주세요 🙏",
              },
            },
          ],
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `KakaoAK ${callbackToken}`,
        },
      }
    );
  }
}
