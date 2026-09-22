import {ShowResource} from '../../../interfaces/show';
import {FirestoreRestClient, getServiceAccountAccessToken} from './core';

// export async function updateShows(newMovies: ShowResource[], newTvSeries: ShowResource[]) {
//
//   // await db.collection("shows").add({
//   //   date: new Date(),
//   //   movies: newMovies,
//   //   tvSeries: newTvSeries,
//   // });
// }

export async function updateShows(
  env: Env,
  newMovies: ShowResource[],
  newTvSeries: ShowResource[],
) {
  console.log(env)
  const accessToken = await getServiceAccountAccessToken(env);
  const db = new FirestoreRestClient(env.FIREBASE_PROJECT_ID, accessToken);

  const doc = await db.create('shows', {
    date: new Date(),
    movies: newMovies,
    tvSeries: newTvSeries,
  });
}
