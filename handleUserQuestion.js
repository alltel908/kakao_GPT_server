import { callGPTWithFAQ_before_esim } from './callGPTWithFAQ_before_esim.js';
import { callGPTWithFAQ_before_usim } from './callGPTWithFAQ_before_usim.js';
import { callGPTWithFAQ_before_wifi } from './callGPTWithFAQ_before_wifi.js';
import { callGPTWithFAQ_after_esim } from './callGPTWithFAQ_after_esim.js';
import { callGPTWithFAQ_after_usim } from './callGPTWithFAQ_after_usim.js';
import { callGPTWithFAQ_after_wifi } from './callGPTWithFAQ_after_wifi.js';

export async function getAnswer(userInput, purchaseState, productType) {
  try {
    console.log('[userInput]', userInput);
    console.log('[purchaseState]', purchaseState);
    console.log('[productType]', productType);

    const key = `${purchaseState}_${productType}`;

    // 전문가 함수 매핑
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
      console.error('[오류] 해당하는 전문가 함수를 찾을 수 없습니다:', key);
      return '죄송합니다, 문의하신 내용의 담당자를 찾을 수 없습니다. 다시 선택해 주세요.';
    }

    const gptAnswer = await expertFunction(userInput);
    return gptAnswer;
  } catch (error) {
    console.error('[getAnswer Error]', error);
    return '죄송합니다. 답변을 생성하는 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.';
  }
}
