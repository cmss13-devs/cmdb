/**
 * Attempt to refresh the session token
 */
const attemptRefresh = async (): Promise<boolean> => {
  try {
    const refreshRes = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });
    return refreshRes.ok;
  } catch {
    return false;
  }
};

/**
 * Redirect to login page, preserving current location
 */
const redirectToLogin = (): never => {
  const currentPath = window.location.pathname + window.location.hash;
  window.location.href = `/api/auth/login?redirect=${encodeURIComponent(currentPath)}`;
  throw new Error("Session expired - redirecting to login");
};

/**
 * Make an authenticated API call with automatic token refresh handling
 */
export const callApi = async (
  toCall: string,
  init?: RequestInit | undefined
): Promise<Response> => {
  const response = await fetch(`/api${toCall}`, {
    ...init,
    credentials: "include",
  });

  if (response.status === 401) {
    // Attempt token refresh
    const refreshed = await attemptRefresh();

    if (refreshed) {
      // Retry original request
      return fetch(`/api${toCall}`, {
        ...init,
        credentials: "include",
      });
    }

    // Refresh failed, redirect to login
    redirectToLogin();
  }

  if (response.status === 403) {
    throw new Error("Access denied - insufficient permissions");
  }

  return response;
};
