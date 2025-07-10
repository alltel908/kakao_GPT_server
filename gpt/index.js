import { callGPTWithFAQ_esim } from './callGPTWithFAQ_esim.js';
import { callGPTWithFAQ_usim } from './callGPTWithFAQ_usim.js';
import { callGPTWithFAQ_wifi } from './callGPTWithFAQ_wifi.js';

export function getFAQGptFunctionByCategory(category) {
  switch (category) {
    case 'esim':
      return callGPTWithFAQ_esim;
    case 'usim':
      return callGPTWithFAQ_usim;
    case 'wifi':
      return callGPTWithFAQ_wifi;
    default:
      throw new Error(`지원하지 않는 카테고리입니다: ${category}`);
  }
}
