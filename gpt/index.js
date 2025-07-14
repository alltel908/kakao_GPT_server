// gpt/index.js

import { callGPTWithFAQ_before_esim } from './callGPTWithFAQ_before_esim.js';
import { callGPTWithFAQ_before_usim } from './callGPTWithFAQ_before_usim.js';
import { callGPTWithFAQ_before_wifi } from './callGPTWithFAQ_before_wifi.js';
import { callGPTWithFAQ_after_esim } from './callGPTWithFAQ_after_esim.js';
import { callGPTWithFAQ_after_usim } from './callGPTWithFAQ_after_usim.js';
import { callGPTWithFAQ_after_wifi } from './callGPTWithFAQ_after_wifi.js';

// ✅ 모든 전문가(GPT 함수)들을 하나의 목록으로 관리
const gptFunctions = {
  before_esim: callGPTWithFAQ_before_esim,
  before_usim: callGPTWithFAQ_before_usim,
  before_wifi: callGPTWithFAQ_before_wifi,
  after_esim: callGPTWithFAQ_after_esim,
  after_usim: callGPTWithFAQ_after_usim,
  after_wifi: callGPTWithFAQ_after_wifi,
};

/**
 * '구매상태_상품' 형식의 키를 받아, 해당하는 전문가 함수를 찾아 돌려주는 함수
 * @param {string} combinedKey - 예: "before_usim"
 * @returns {Function} 해당하는 GPT 전문가 함수
 */
export function getFAQGptFunctionByCombinedKey(combinedKey) {
  return gptFunctions[combinedKey];
}
