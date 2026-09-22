/// <reference path="../../../worker-configuration.d.ts" />

export async function handlePing(request: Request, env: Env): Promise<Response> {
  return Response.json({message: 'Ciao dal Backend!'});
}
