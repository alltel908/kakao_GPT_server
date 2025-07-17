// /utils/classify.js

// 간단한 키워드 기반으로 사용자의 질문 의도를 분류합니다.
export function classifyProduct(utterance) {
  const lowerCaseUtterance = utterance.toLowerCase();

  if (lowerCaseUtterance.includes('esim') || lowerCaseUtterance.includes('qr')) {
    return 'esim';
  }
  if (lowerCaseUtterance.includes('usim') || lowerCaseUtterance.includes('유심')) {
    return 'usim';
  }
  if (lowerCaseUtterance.includes('wifi') || lowerCaseUtterance.includes('와이파이') || lowerCaseUtterance.includes('에그')) {
    return 'wifi';
  }
  
  // 어떤 것에도 해당하지 않으면 기본값 반환 (또는 null)
  return 'default'; 
}