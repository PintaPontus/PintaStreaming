import {ShowResource} from '../../../interfaces/show';
import {FirestoreRestClient, getServiceAccountAccessToken} from './core';

export async function updateShows(
  env: Env,
  newMovies: ShowResource[],
  newTvSeries: ShowResource[],
) {
  const accessToken = await getServiceAccountAccessToken(env);
  const db = new FirestoreRestClient(env.FIREBASE_PROJECT_ID, accessToken);

  return await db.create('shows', {
    date: new Date(),
    movies: newMovies,
    tvSeries: newTvSeries,
  });
}
