/// <reference path="../../../worker-configuration.d.ts" />

import {ShowResource} from '../../interfaces/show';
import {fetchGet} from '../utils/httpFetch';
import {updateShows} from '../utils/firebase/shows';

export async function updateStreamList(env: Env) {
  const streamMoviesList: ShowResource[] = await fetchGet(
    "https://vixsrc.to/api/list/movie/?lang=it"
  );
  const streamTvSeriesList: ShowResource[] = await fetchGet(
    "https://vixsrc.to/api/list/tv/?lang=it"
  );
  await updateShows(env, streamMoviesList, streamTvSeriesList)
}

