import { getAnswer } from '../handleUserQuestion.js';

export default async function handler(req, res) {
  try {
    const { userRequest, action } = req.body;

    const userInput = userRequest?.utterance;
    const params = action?.params;
    const context = action?.clientExtra?.context || {};

    const purchaseState = context.purchase_state || context.purchaseState;
    const productType = context.product_type || context.productType;

    console.log('[userInput]', userInput);
    console.log('[purchaseState]', purchaseState);
    console.log('[productType]', productType);

    // ✅ 필수 context 값 누락 시 안내 메시지 반환
    if (!purchaseState || !productType) {
      console.warn('[경고] 필수 context 누락 - 초기 상품 선택 필요');
      return res.status(200).json({
        version: '2.0',
        template: {
          outputs: [
            {
              simpleText: {
                text: '문의하신 상품을 먼저 선택해 주세요.\n(예: 구매 전 유심, 구매 후 이심 등)',
              },
            },
          ],
        },
      });
    }

    const gptResponse = await getAnswer(userInput, purchaseState, productType);

    return res.status(200).json({
      version: '2.0',
      template: {
        outputs: [
          {
            simpleText: {
              text: gptResponse,
            },
          },
        ],
      },
    });
  } catch (error) {
    console.error('[GPT 응답 오류]', error);
    return res.status(500).json({
      version: '2.0',
      template: {
        outputs: [
          {
            simpleText: {
              text: '죄송합니다. 응답 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
            },
          },
        ],
      },
    });
  }
}

