import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  project: "proj_AYFkjvKe8VxQusQByJfeAKW2"
});

// eSIM FAQ 전체 - 질문/키워드/답변
const esimFAQ = [
  {
    question: "어떤 기기에서 eSIM을 사용할 수 있나요?",
    keywords: ["eSIM", "기기", "모델", "호환", "지원"],
    answer: "아래의 방법 중에서 선택해서 이심 사용이 가능한 모델인지 확인하면 되세요.\n\n1. 전화 키패드에서 *#06# 눌러서 EID 정보가 표시되는지 여부 확인해 주세요.\n2. 휴대폰의 설정에서 해당 메뉴 표시 여부 확인해 주세요.\n  . 아이폰: 설정 → 셀룰서 → eSIM(셀룰러) 추가.\n  . 안드로이드: 설정 → 연결 → SIM관리자 → 모바일 요금제 추가."
  },
  {
    question: "eSIM을 국내에서 미리 설치할 수 있나요?",
    keywords: ["국내 설치", "미리", "출국 전", "설치 가능", "사전"],
    answer: ". 구매하신 상품 페이지 중간쯤의 요금제표에 \"등록위치\"에서 안내되고 있으니 확인해 주세요.\n. 사용 국가에 한국이 포함된 요금제는 등록(설치)하면 사용일이 시작되니 유의해 주세요."
  }
];

// GPT 호출 함수
export async function callGPTWithFAQ_esim(userInput) {
  const faqTextBlock = esimFAQ
    .map(
      (f, i) => `#${i + 1}\nQ: ${f.question}\nK: ${f.keywords.join(', ')}\nA: ${f.answer}`
    )
    .join('\n\n');

  const messages = [
   {
  role: "system",
  content: `
당신은 해외 유심 및 포켓와이파이를 판매하는 올텔의 고객센터 상담사입니다.
고객이 입력한 질문을 친절하고 신뢰감 있게 이해하고 답변해 주세요.

- 아래는 자주 묻는 질문(FAQ)입니다. 질문에 직접적인 답변이 없더라도, 관련된 내용을 참고하거나 유추해서 도와주세요.
- 질문이 불분명하거나 정보가 부족하면, 공손하게 추가 정보를 요청하세요.
- 가능한 경우에는 고객이 원할 답을 예측해서 설명하고, 정말 필요한 경우에만 고객센터 안내를 해주세요.
- 답변은 자연스럽고 공손한 말투로 제공해 주세요.

아래는 참고용 FAQ입니다:
${faqTextBlock}
`
},
    {
      role: "user",
      content: userInput
    }
  ];

  const chat = await openai.chat.completions.create({
    model: "gpt-4o",
    messages
  });

  return chat.choices[0].message.content;
}