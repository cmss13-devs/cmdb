import React from "react";
import { useEffect, useState } from "react";
import { GlobalContext, User } from "./types/global";
import { Link, Outlet, useSearchParams } from "react-router-dom";
import { LinkColor } from "./components/link";

export default function App(): React.ReactElement {
  const [toastMessage, showToastMessage] = useState<string | null>();
  const [user, setUser] = useState<User | undefined>();

  const [searchParams, setSearchParams] = useSearchParams();

  const displayToast = (string: string) => {
    showToastMessage(string);
    setTimeout(() => {
      showToastMessage("");
    }, 3000);
  };

  useEffect(() => {
    if (!user) {
      if (import.meta.env.PROD) {
        fetch(
          `${location.protocol}//${location.host}/` + "oauth2/userinfo"
        ).then((value) => value.json().then((json) => setUser(json)));
      }
      if (import.meta.env.VITE_FAKE_USER) {
        setUser({
          preferredUsername: "debug",
          email: "debug@debug.debug",
          groups: [],
        });
      }
    }
  }, [setUser, user]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const existing = params.get("existing");

    if (!existing) return;

    location.replace(`${location.origin}/#${existing}?forceRefresh=true`);
  }, []);

  useEffect(() => {
    if (searchParams.get("forceRefresh")) {
      displayToast("Session reloaded as you were timed out.");
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  return (
    <GlobalContext.Provider
      value={{ updateAndShowToast: displayToast, user: user }}
    >
      <div className="w-full foreground p-3 flex flex-row gap-2">
        <LinkColor>
          <Link to="/" className="underline">
            [cmdb]
          </Link>
        </LinkColor>
        |
        <LinkColor>
          <Link to="/sticky">Sticky Menu</Link>
        </LinkColor>
        |
        <LinkColor>
          <Link to="/ticket">Tickets</Link>
        </LinkColor>
        |
        <LinkColor>
          <Link to="/user">Users</Link>
        </LinkColor>
        |
        <LinkColor>
          <Link to="/whitelists">Whitelists</Link>
        </LinkColor>
      </div>
      <div className="w-full md:container md:mx-auto flex flex-col foreground rounded mt-5 p-5">
        <Outlet />
      </div>
      <div className={`toast ${toastMessage ? "show" : ""}`}>
        {toastMessage}
      </div>
    </GlobalContext.Provider>
  );
}
