import axios from 'axios';

export default async function handler(req, res) {
  try {
    console.log('--- [1] Skill 핸들러 시작 ---');

    const body = req.body;
    const userInput = body?.userRequest?.utterance;
    const callbackUrl = body?.userRequest?.callbackUrl;

    console.log('[2] 1차 응답 전송 시작 ---');
    // 1차 응답 전송
    res.status(200).json({
      version: '2.0',
      useCallback: true,
    });
    console.log('[3] 1차 응답 전송 완료 ---');

    console.log(`[4] 콜백 URL 확인: ${callbackUrl}`);

    if (callbackUrl) {
      console.log('[5] 콜백 응답 전송 시작 ---');

      // 2차 콜백 응답 전송
      await axios.post(callbackUrl, {
        version: '2.0',
        template: {
          outputs: [
            {
              simpleText: {
                text: `입력하신 내용: "${userInput}"에 대해 답변 드립니다.`
              }
            }
          ]
        }
      });

      console.log('[6] 콜백 응답 전송 완료 ---');
    } else {
      console.log('[5] 콜백 URL이 없어 2차 응답 생략');
    }

  } catch (error) {
    console.error('[skill.js 에러]', error);
    res.status(500).json({
      version: '2.0',
      template: {
        outputs: [{ simpleText: { text: '서버 오류가 발생했습니다.' } }],
      },
    });
  }
}
