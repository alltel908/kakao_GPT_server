// handleUserQuestion.js

// ✅ 우리가 이미 만들어 둔, 카테고리별 전문가를 연결해주는 함수를 가져옵니다.
import { getFAQGptFunctionByCategory } from './index.js';

/**
 * 전달받은 카테고리에 맞는 전문가(FAQ 기반 GPT 함수)를 호출해 답변을 받아오는 함수
 * @param {string} userInput - 사용자가 입력한 질문
 * @param {string} category - 'esim', 'usim', 'wifi' 중 하나
 * @returns {Promise<string>} GPT가 생성한 최종 답변
 */
export async function getAnswerByCategory(userInput, category) {
  // 1. 카테고리에 맞는 전문가 함수를 가져옵니다.
  const expertFunction = getFAQGptFunctionByCategory(category);

  // 2. 해당 전문가에게 사용자 질문을 넘겨 답변을 받아옵니다.
  const answer = await expertFunction(userInput);
  
  return answer;
}