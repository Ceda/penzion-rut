export const onRequestGet = async (ctx: {
  env: { FORM_NONCES: KVNamespace };
  request: Request;
}) => {
  const token = crypto.randomUUID(); // nebo jiné náhodné ID

  const ttlSeconds = 300; // 5 minut

  await ctx.env.FORM_NONCES.put(token, '1', { expirationTtl: ttlSeconds });

  return new Response(JSON.stringify({ token, expires_in: ttlSeconds }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Access-Control-Allow-Origin': '*',
    },
  });
};
