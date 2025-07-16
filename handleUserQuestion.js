import { callGPTWithFAQ_esim } from './gpt/callGPTWithFAQ_esim.js';
import { callGPTWithFAQ_usim } from './gpt/callGPTWithFAQ_usim.js';
import { callGPTWithFAQ_wifi } from './gpt/callGPTWithFAQ_wifi.js';

export async function getAnswer(userInput) {
  const lowerInput = userInput.toLowerCase();

  if (lowerInput.includes('와이파이') || lowerInput.includes('wifi')) {
    return await callGPTWithFAQ_wifi(userInput);
  } else if (lowerInput.includes('usim') || lowerInput.includes('유심')) {
    return await callGPTWithFAQ_usim(userInput);
  } else {
    return await callGPTWithFAQ_esim(userInput); // 기본값
  }
}

