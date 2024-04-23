import { useState } from "react";
import "./App.css";
import { LookupMenu } from "./components/userLookup";
import { IpLookup } from "./components/ipLookup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { GlobalContext } from "./types/global";
import { CidLookup } from "./components/cidLookup";

export default function App() {
  const [toastMessage, showToastMessage] = useState<string | null>(null);

  const [option, setOption] = useState<string | null>(null);

  const displayToast = (string: string) => {
    showToastMessage(string);
    setTimeout(() => {
      showToastMessage("");
    }, 3000);
  };

  return (
    <GlobalContext.Provider value={{ updateAndShowToast: displayToast }}>
      <div className="w-full md:container md:mx-auto flex flex-col foreground min-h-screen rounded mt-5 p-5">
        <div className="flex flex-row justify-center">
          <div className="flex flex-col gap-3">
            <div className="text-3xl underline text-center">cmdb</div>
            {option && (
              <div className="flex flex-row justify-center">
                <div
                  className="flex flex-row justify-center gap-1 border-white border cursor-pointer w-20"
                  onClick={() => setOption(null)}
                >
                  <div className="flex flex-col justify-center">
                    <FontAwesomeIcon icon={faXmark} />
                  </div>
                  Exit
                </div>
              </div>
            )}

            {!option && (
              <div className="flex flex-row gap-3">
                <div
                  className="border border-white p-3 cursor-pointer"
                  onClick={() => setOption("lookup")}
                >
                  Lookup User
                </div>
                <div
                  className="border border-white p-3 cursor-pointer"
                  onClick={() => setOption("ip")}
                >
                  Lookup IP
                </div>
                <div
                  className="border border-white p-3 cursor-pointer"
                  onClick={() => setOption("cid")}
                >
                  Lookup CID
                </div>
              </div>
            )}

            {option === "lookup" && <LookupMenu />}
            {option === "ip" && <IpLookup />}
            {option === "cid" && <CidLookup />}
          </div>
        </div>
        <div className={`toast ${toastMessage ? "show" : ""}`}>
          {toastMessage}
        </div>
      </div>
    </GlobalContext.Provider>
  );
}
