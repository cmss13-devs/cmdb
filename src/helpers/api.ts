export const callApi = async (toCall: string, init?: RequestInit | undefined): Promise<Response> => {
  const response = await fetch(`${import.meta.env.VITE_API_PATH}${toCall}`, init)
  if (response.status == 400) {
    location.replace(`${location.href}/?forceRefresh=true`)
  }
  return response
}
