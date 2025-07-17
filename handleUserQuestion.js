// /api/handleUserQuestion.js

export default async function handleUserQuestion(utterance) {
  const functionName = 'handleUserQuestion';

  try {
    console.log(`[${functionName}] Simulating GPT response...`);

    // 💡 실제 GPT 연동을 사용할 경우, 이 부분을 확장합니다.
    // 예시: const completion = await openai.createChatCompletion({ ... });
    // 여기는 임시 시뮬레이션 값
    const gptResponse = `🔍 질문 "${utterance}"에 대한 응답입니다.`;

    // GPT 응답이 비어있거나 이상하면 fallback
    if (!gptResponse || typeof gptResponse !== 'string') {
      throw new Error('Invalid GPT response');
    }

    return gptResponse;

  } catch (error) {
    console.error(`[${functionName}] ERROR during GPT simulation`, error);
    // fallback 메시지
    return '❗ 현재 답변 생성 중 문제가 발생했습니다. 나중에 다시 시도해주세요.';
  }
}
