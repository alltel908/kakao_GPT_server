import { getAnswer } from '../handleUserQuestion.js';

export default async function handler(req, res) {
  const userInput = req.body?.userRequest?.utterance;

  console.log('[유저 입력]', userInput);

  try {
    const answer = await getAnswer(userInput);

    return res.status(200).json({
      version: '2.0',
      template: {
        outputs: [
          {
            simpleText: {
              text: answer || '답변을 생성하지 못했어요.',
            },
          },
        ],
      },
    });
  } catch (err) {
    console.error('[GPT 호출 실패]', err);
    return res.status(500).json({
      version: '2.0',
      template: {
        outputs: [
          {
            simpleText: {
              text: '죄송합니다. 응답 중 오류가 발생했습니다.',
            },
          },
        ],
      },
    });
  }
}


