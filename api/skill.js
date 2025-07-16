import { getAnswer } from '../handleUserQuestion.js';

export default async function handler(req, res) {
  try {
    const { userRequest } = req.body;
    const userInput = userRequest?.utterance;

    // 최종 바구니(컨텍스트)를 찾습니다.
    const finalContext = userRequest?.context?.values?.find(c => c.name === 'C_final_topic');

    // 바구니나 그 안의 데이터 조각(파라미터)이 없으면, 맥락을 알 수 없습니다.
    if (!finalContext || !finalContext.params) {
      return res.status(200).json({
        version: '2.0',
        template: {
          outputs: [{ simpleText: { text: '죄송합니다. 질문을 이해하지 못했습니다. 문의하실 상품을 먼저 선택해주세요.' }}],
        },
      });
    }
    
    // 바구니 안의 데이터 조각(파라미터)에서 최종 값을 추출합니다.
    const purchaseState = finalContext.params.final_purchaseState?.value;
    const productType = finalContext.params.final_productType?.value;

    console.log('[userInput]', userInput);
    console.log('[purchaseState from Context]', purchaseState);
    console.log('[productType from Context]', productType);

    const gptResponse = await getAnswer(userInput, purchaseState, productType);

    // 답변 후에는 컨텍스트를 비워 다음 질문에 영향이 없도록 합니다.
    return res.status(200).json({
      version: '2.0',
      template: {
        outputs: [{ simpleText: { text: gptResponse }}],
      },
      context: {
        lifespan: 0
      }
    });

  } catch (error) {
    console.error('[skill.js 오류]', error);
    // ... (에러 처리 부분은 동일) ...
  }
}