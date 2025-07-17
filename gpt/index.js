// /gpt/index.js

import { callGPTWithFAQ_esim } from './callGPTWithFAQ_esim.js';
import { callGPTWithFAQ_usim } from './callGPTWithFAQ_usim.js';
import { callGPTWithFAQ_wifi } from './callGPTWithFAQ_wifi.js';

// ✅ 모든 전문가(GPT 함수)들을 하나의 목록으로 관리
const gptExperts = {
  esim: callGPTWithFAQ_esim,
  usim: callGPTWithFAQ_usim,
  wifi: callGPTWithFAQ_wifi,
  // 'default' 전문가가 필요하다면 여기에 추가할 수 있습니다.
  // default: callGPTWithGeneralFAQ 
};

/**
 * '상품' 키를 받아, 해당하는 전문가 함수를 찾아 돌려주는 함수
 * @param {string} productKey - 예: "esim"
 * @returns {Function} 해당하는 GPT 전문가 함수
 */
export function getGptExpert(productKey) {
  return gptExperts[productKey] || null; // 해당하는 전문가가 없으면 null 반환
}