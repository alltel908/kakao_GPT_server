// handleUserQuestion.js

import { getFAQGptFunctionByCombinedKey } from './gpt/index.js';

/**
 * 구매 상태와 상품 종류를 조합해, 알맞은 전문가에게 답변을 받아오는 함수
 * @param {string} userInput - 사용자가 입력한 질문
 * @param {string} purchaseState - 'before' 또는 'after'
 * @param {string} productType - 'esim', 'usim', 'wifi' 중 하나
 * @returns {Promise<string>} GPT가 생성한 최종 답변
 */
export async function getAnswer(userInput, purchaseState, productType) {
  // 1. 두 정보를 조합하여 키를 만듭니다. (예: "before_usim")
  const combinedKey = `${purchaseState}_${productType}`;

  // 2. 조합된 키를 안내 데스크에 전달하여 담당 전문가 함수를 찾습니다.
  const expertFunction = getFAQGptFunctionByCombinedKey(combinedKey);

  // 3. 만약 담당 전문가가 없다면, 기본 응답을 보냅니다.
  if (!expertFunction) {
    console.error(`[오류] ${combinedKey}에 해당하는 전문가 함수를 찾을 수 없습니다.`);
    return "죄송합니다, 문의하신 내용의 담당자를 찾을 수 없습니다. 다시 선택해 주세요.";
  }

  // 4. 찾은 전문가에게 사용자 질문을 넘겨 최종 답변을 받아옵니다.
  const answer = await expertFunction(userInput);
  return answer;
}