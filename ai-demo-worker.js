export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const prompt = url.searchParams.get('prompt');

    if (!prompt) {
      return Response.json({
        usage: 'AI 推理演示 — 使用 Cloudflare Workers AI',
        models: [
          '@cf/meta/llama-3.2-3b-instruct',
          '@cf/meta/llama-2-7b-chat-int8',
          '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b',
        ],
        example: `${url.origin}?prompt=你好，请用一句话介绍你自己`,
      });
    }

    try {
      const model = url.searchParams.get('model') || '@cf/meta/llama-3.2-3b-instruct';
      const messages = [
        { role: 'user', content: prompt },
      ];

      const result = await env.AI.run(model, { messages, max_tokens: 512 });

      return Response.json({
        model,
        prompt,
        response: result.response || result,
      });
    } catch (err) {
      return Response.json(
        { error: `AI 调用失败: ${err.message}`, hint: '确认账户已开启 Workers AI 且模型可用' },
        { status: 500 }
      );
    }
  },
};
