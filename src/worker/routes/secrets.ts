/// <reference path="../../../worker-configuration.d.ts" />

export async function handleVideoDomain(env: Env): Promise<Response> {
  return Response.json({domain: env.VIDEO_STREAMING_DOMAIN});
}
