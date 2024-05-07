import React, { PropsWithChildren, useEffect, useRef, useState } from "react";
import { LookupMenu } from "./components/userLookup";
import { IpLookup } from "./components/ipLookup";
import { GlobalContext, User } from "./types/global";
import { CidLookup } from "./components/cidLookup";
import { RoundData } from "./components/roundData";
import { Dialog } from "./components/dialog";
import { Stickybans } from "./components/stickybans";

export default function App(): React.ReactElement {
  const [toastMessage, showToastMessage] = useState<string | null>();
  const [stickyMenu, setStickyMenu] = useState(false);
  const [user, setUser] = useState<User | undefined>();

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
    const amount = location.href.search(/\?forceRefresh=true/);
    if (amount > 0) {
      displayToast("Session reloaded as you were timed out.");
    }
  }, []);

  return (
    <GlobalContext.Provider
      value={{ updateAndShowToast: displayToast, user: user }}
    >
      <div className="w-full md:container md:mx-auto flex flex-col foreground min-h-screen rounded mt-5 p-5">
        <div className="md:flex flex-row justify-center">
          <div className="flex flex-col gap-3">
            <div className="flex flex-row justify-between">
              <div className="text-3xl underline text-center">[cmdb]</div>
              {user && <div>{user.preferredUsername}</div>}
            </div>
            <div className="flex flex-col md:flex-row gap-3">
              <LookupOption type="lookup">Lookup User</LookupOption>
              <LookupOption type="ip">Lookup IP</LookupOption>
              <LookupOption type="cid">Lookup CID</LookupOption>
            </div>

            <div
              onClick={() => setStickyMenu(true)}
              className={"border border-white p-3 cursor-pointer grow clicky"}
            >
              Sticky Menu
            </div>
            {stickyMenu && (
              <Dialog
                open={stickyMenu}
                toggle={() => setStickyMenu(false)}
                className="w-11/12"
              >
                <Stickybans />
              </Dialog>
            )}

            <RoundData />
          </div>
        </div>
        <div className={`toast ${toastMessage ? "show" : ""}`}>
          {toastMessage}
        </div>
      </div>
    </GlobalContext.Provider>
  );
}

interface LookupProps extends PropsWithChildren {
  type: "lookup" | "ip" | "cid";
}

const LookupOption = (props: LookupProps) => {
  const [selected, setSelected] = useState(false);
  const [value, setValue] = useState<string | null>(null);
  const [heldValue, setHeldValue] = useState<string | null>(null);
  const [timer, setTimer] = useState<number>(0);

  const { type } = props;

  const inputRef = useRef<HTMLInputElement>(null);

  const close = () => setValue(null);

  return (
    <>
      <div
        className="border border-white p-3 cursor-pointer grow clicky"
        onClick={() => {
          setSelected(true);
          clearTimeout(timer);
          const timeout = setTimeout(() => {
            setSelected(false);
          }, 6000);
          setTimeout(() => {
            inputRef.current?.focus();
          }, 1);
          setTimer(timeout);
        }}
      >
        {selected && (
          <form
            className="flex flex-row justify-center gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              setValue(heldValue);
            }}
          >
            <input
              type="text"
              value={heldValue ?? ""}
              ref={inputRef}
              onInput={(event) => {
                const target = event.target as HTMLInputElement;
                setHeldValue(target.value);
                clearTimeout(timer);
                setTimer(
                  setTimeout(() => {
                    setSelected(false);
                  }, 10000)
                );
              }}
            ></input>
          </form>
        )}
        {!selected && props.children}
      </div>
      {value && (
        <Dialog
          open={!!value}
          toggle={() => setValue(null)}
          className="md:w-11/12 md:h-11/12"
        >
          {type == "lookup" && <LookupMenu value={value} close={close} />}
          {type == "cid" && <CidLookup initialCid={value} close={close} />}
          {type == "ip" && <IpLookup initialIp={value} close={close} />}
        </Dialog>
      )}
    </>
  );
};
