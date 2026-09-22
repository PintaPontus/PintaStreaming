export async function fetchGet<T>(url: string): Promise<T> {
  const response = await fetch(
    url,
    {
      method: 'GET',
    },
  );

  return await response.json() as T;
}
