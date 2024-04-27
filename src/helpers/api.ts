export const callApi = async (toCall: string, init?: RequestInit | undefined): Promise<Response> => {
  const response = await fetch(`${import.meta.env.VITE_API_PATH}${toCall}`, init)
  if (response.status == 400) {
    const amount = location.href.search(/\?forceRefresh=true/);
    if(amount > 0) {
      location.reload();
    }
    else {
    location.replace(location.href + "?forceReload=true")
    }
  }
  return response
}
