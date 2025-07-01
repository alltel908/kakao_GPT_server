const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post('/', (req, res) => {
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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
