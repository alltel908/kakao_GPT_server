require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post(['/', '/skill'], async (req, res) => {
  console.log('카카오 요청 수신:', req.body);

  const userMessage = req.body?.userRequest?.utterance || '안녕하세요';

  try {
    const gptResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        // ✅ 여기가 핵심: GPT-4o mini 모델명
        model: 'gpt-4o-mini', // ⚠️ 사용 가능 여부 반드시 확인
        messages: [
          { role: 'system', content: '친절한 비서처럼 응답해주세요.' },
          { role: 'user', content: userMessage }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        }
      }
    );

    const replyText = gptResponse.data.choices[0].message.content;

    const kakaoResponse = {
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
    };

    res.json(kakaoResponse);

  } catch (error) {
    console.error('GPT 요청 오류:', error.message);

    res.json({
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
    });
  }
});

app.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
});
