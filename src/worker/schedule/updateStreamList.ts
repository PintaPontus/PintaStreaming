/// <reference path="../../../worker-configuration.d.ts" />

import {ShowResource} from '../../interfaces/show';
import {fetchGet} from '../utils/httpFetch';
import {deleteOldShowsLists, updateShows} from '../utils/firebase/shows';

export async function updateStreamList(env: Env) {
  const streamMoviesList = await fetchGet<ShowResource[]>("https://vixsrc.to/api/list/movie/?lang=it");
  const streamTvSeriesList = await fetchGet<ShowResource[]>("https://vixsrc.to/api/list/tv/?lang=it");
  try {
    await updateShows(env, streamMoviesList, streamTvSeriesList);
    console.log(`Show list aggiornata: ${streamMoviesList.length} film e ${streamTvSeriesList.length} serie TV`);
    const countDeleted = await deleteOldShowsLists(env);
    console.log(`Deleted ${countDeleted} old shows`);
  } catch (error) {
    console.error("Errore durante l'aggiornamento: ", error);
  }
}

