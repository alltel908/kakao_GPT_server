const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// JSON 바디 파싱을 위한 미들웨어
app.use(express.json());

// 카카오 i 오픈빌더가 요청을 보내는 엔드포인트: '/', '/skill' 둘 다 대응
app.post(['/', '/skill'], (req, res) => {
  console.log('카카오 요청 수신:', req.body);

  const responseBody = {
    version: "2.0",
    template: {
      outputs: [
        {
          simpleText: {
            text: "안녕하세요! GPT 응답 테스트입니다."
          }
        }
      ]
    }
  };

  res.json(responseBody);
});

// 서버 실행
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
