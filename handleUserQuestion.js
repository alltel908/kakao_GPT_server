import { callGPTWithFAQ_before_esim } from './gpt/callGPTWithFAQ_before_esim.js';
import { callGPTWithFAQ_before_usim } from './gpt/callGPTWithFAQ_before_usim.js';
import { callGPTWithFAQ_before_wifi } from './gpt/callGPTWithFAQ_before_wifi.js';
import { callGPTWithFAQ_after_esim } from './gpt/callGPTWithFAQ_after_esim.js';
import { callGPTWithFAQ_after_usim } from './gpt/callGPTWithFAQ_after_usim.js';
import { callGPTWithFAQ_after_wifi } from './gpt/callGPTWithFAQ_after_wifi.js';

export async function getAnswer(userInput, purchaseState, productType) {
  if (!purchaseState || !productType) {
    console.error('[오류] purchaseState 또는 productType이 정의되지 않았습니다.');
    return '죄송합니다, 문의하신 내용의 담당자를 찾을 수 없습니다. 다시 선택해 주세요.';
  }

  const key = `${purchaseState}_${productType}`.toLowerCase();

  const expertMap = {
    before_esim: callGPTWithFAQ_before_esim,
    before_usim: callGPTWithFAQ_before_usim,
    before_wifi: callGPTWithFAQ_before_wifi,
    after_esim: callGPTWithFAQ_after_esim,
    after_usim: callGPTWithFAQ_after_usim,
    after_wifi: callGPTWithFAQ_after_wifi,
  };

  const expertFunction = expertMap[key];

  if (!expertFunction) {
    console.error(`[오류] ${key}에 해당하는 전문가 함수를 찾을 수 없습니다.`);
    return '죄송합니다, 문의하신 내용의 담당자를 찾을 수 없습니다. 다시 선택해 주세요.';
  }

  const gptResponse = await expertFunction(userInput);
  return gptResponse;
}
