/// <reference path="../../worker-configuration.d.ts" />

import {handlePing} from './routes/ping';
import {updateStreamList} from './schedule/updateStreamList';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const {pathname} = new URL(request.url);

    if (pathname === '/api/ping' || pathname === '/api/ping/') {
      return handlePing(request, env);
    }

    if (pathname === '/api/update-stream-list' || pathname === '/api/update-stream-list/') {
      await updateStreamList(env);
      return Response.json({message: 'Update stream list started!'});
    }

    return env.ASSETS.fetch(request);
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    await updateStreamList(env)
  }
};
