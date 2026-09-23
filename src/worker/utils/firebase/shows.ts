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

export async function deleteOldShowsLists(
  env: Env
) {
  const accessToken = await getServiceAccountAccessToken(env);
  const db = new FirestoreRestClient(env.FIREBASE_PROJECT_ID, accessToken);

  const structuredQuery = {
    from: [{collectionId: 'shows'}],
    orderBy: [
      {
        field: {fieldPath: 'date'},
        direction: 'DESCENDING',
      },
    ],
    offset: 24,
  };

  const rawDocs = await db.query(structuredQuery);

  await Promise.allSettled(rawDocs.map(rd => {
    const docID = rd.name.substring(rd.name.lastIndexOf("/") + 1);
    return db.delete('shows', docID)
  }));

  return rawDocs.length;
}
