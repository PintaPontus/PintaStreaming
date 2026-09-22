/// <reference path="../../worker-configuration.d.ts" />

import {handlePing} from './routes/ping';
import {updateStreamList} from './schedule/updateStreamList';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const {pathname} = new URL(request.url);

    if (pathname === '/api/ping' || pathname === '/api/ping/') {
      return handlePing(request, env);
    }

    if (pathname === '/api/fire' || pathname === '/api/fire/') {
      await updateStreamList(env);
    }

    return env.ASSETS.fetch(request);
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(updateStreamList(env))
  }
};
