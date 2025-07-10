require('dotenv').config();
const axios = require('axios');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('요청 수신됨');
  const userMessage = req.body?.userRequest?.utterance;
  const callbackUrl = req.body?.userRequest?.callbackUrl;
  const taskId = req.body?.userRequest?.taskId;

  if (!userMessage || !callbackUrl || !taskId) {
    return res.status(400).json({
      version: "2.0",
      template: {
        outputs: [
          {
            simpleText: {
              text: "요청 정보가 부족합니다. 다시 시도해 주세요."
            }
          }
        ]
      }
    });
  }

  // 1차 응답: 준비 중 메시지
  res.status(200).json({
    version: "2.0",
    useCallback: true,
    data: {
      text: "답변을 준비 중이에요 😊 잠시만 기다려 주세요!"
    }
  });

  // 2차 응답: GPT 호출 + 콜백 응답
  try {
    const gptResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: '친절한 비서처럼 응답해주세요.' },
          { role: 'user', content: userMessage }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        }
      }
    );

    const replyText = gptResponse.data.choices[0].message.content;

    // 콜백 URL로 최종 응답 전송
    await axios.post(callbackUrl, {
      taskId,
      status: "SUCCESS",
      message: "",
      timestamp: Date.now(),
      data: {
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
      }
    });

    console.log("콜백 응답 전송 완료");

  } catch (error) {
    console.error("GPT 또는 콜백 오류:", error.response?.data || error.message);

    // GPT 오류시에도 콜백 응답을 보내주자
    await axios.post(callbackUrl, {
      taskId,
      status: "SUCCESS",
      message: "",
      timestamp: Date.now(),
      data: {
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
      }
    });
  }
};
