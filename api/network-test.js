// /api/callback-test.js

// Node.js v18+ 부터 내장된 fetch API를 사용합니다. (axios 등 외부 라이브러리 제거)
export default async function handler(req, res) {
  const callbackUrl = req.body?.userRequest?.callbackUrl;
  const userInput = req.body?.userRequest?.utterance;

  // 1. 카카오 서버에 '콜백을 사용하겠다'는 초기 응답을 보냅니다.
  // 이 부분이 실패하면 Vercel 로그에 에러가 남습니다.
  try {
    res.status(200).json({
      version: '2.0',
      useCallback: true,
    });
    console.log(`[1/3] Initial response sent for: "${userInput}"`);
  } catch (error) {
    console.error('[ERROR] Failed to send initial response', error);
    // 초기 응답부터 실패하면 더 이상 진행할 수 없으므로 여기서 종료합니다.
    return;
  }

  // 2. 2초 후, 백그라운드에서 카카오 콜백 URL로 최종 답변을 보냅니다.
  // 이 과정은 외부 API 호출 없이 순수하게 시간만 기다렸다가 실행됩니다.
  setTimeout(async () => {
    try {
      console.log('[2/3] Preparing to send final callback...');
      
      const finalPayload = {
        version: '2.0',
        template: {
          outputs: [
            {
              simpleText: {
                text: `✅ 2초 후 콜백 성공: "${userInput}"`,
              },
            },
          ],
        },
      };

      // 내장 fetch를 사용하여 콜백 URL로 POST 요청
      const fetchResponse = await fetch(callbackUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalPayload),
      });

      if (!fetchResponse.ok) {
        // fetch는 성공했으나, 카카오 서버가 에러(4xx, 5xx)를 반환한 경우
        const errorBody = await fetchResponse.text();
        throw new Error(`Kakao server responded with status ${fetchResponse.status}: ${errorBody}`);
      }
      
      console.log('[3/3] Final callback sent successfully!');

    } catch (error) {
      // fetch 자체가 실패했거나(네트워크 문제), 카카오가 에러를 반환한 경우
      console.error('[ERROR] Failed to send final callback', error);
    }
  }, 2000); // 2초 (2000ms) 지연
}