require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post(['/', '/skill'], async (req, res) => {
  console.log('✅ 요청 수신됨');
  console.log('헤더:', req.headers);
  console.log('바디:', JSON.stringify(req.body, null, 2));

  const userMessage = req.body?.userRequest?.utterance;

  if (!userMessage) {
    console.error('❌ userRequest.utterance가 없습니다.');
    return res.json({
      version: "2.0",
      template: {
        outputs: [
          {
            simpleText: {
              text: "요청 내용이 없습니다. 다시 시도해 주세요."
            }
          }
        ]
      }
    });
  }

  try {
    const gptResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
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

    return res.json({
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

  } catch (error) {
    console.error('❌ GPT 요청 오류:', error.response?.data || error.message);

    return res.json({
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
