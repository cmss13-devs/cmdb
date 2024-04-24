import React, {
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { GlobalContext } from "../types/global";
import { ConnectionHistory } from "../types/loginTriplet";
import { TripletList } from "./tripletsList";

interface CidLookupProps extends PropsWithChildren {
  initialCid?: string;
}

export const CidLookup: React.FC<CidLookupProps> = (props: CidLookupProps) => {
  const { initialCid } = props;

  const [cid, setCid] = useState<string>("");
  const [ipData, setCidData] = useState<ConnectionHistory | null>(null);

  const [loading, setLoading] = useState(false);

  const global = useContext(GlobalContext);

  useEffect(() => {
    if (initialCid && !ipData) {
      updateCid(initialCid);
    }
  });

  const updateCid = (override?: string) => {
    setLoading(true);
    if (override) {
      setCid(override);
    }
    fetch(
      `${import.meta.env.VITE_API_PATH}/Connections/Cid?cid=${
        override ? override : cid
      }`
    ).then((value) =>
      value.json().then((json) => {
        setLoading(false);
        if (json.status == 404) {
          global?.updateAndShowToast("No connections by CID.");
        } else {
          setCidData(json);
        }
      })
    );
  };

  return (
    <>
      <form
        className="flex flex-row justify-center gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          updateCid();
        }}
      >
        <label htmlFor="computer_id">CID: </label>
        <input
          type="text"
          id="computer_id"
          name="computer_id"
          value={cid}
          onInput={(event) => {
            const target = event.target as HTMLInputElement;
            setCid(target.value);
          }}
        ></input>
      </form>

      {loading && <div className="text-2xl text-center">Loading...</div>}
      {ipData?.triplets && <TripletList triplets={ipData.triplets} />}
    </>
  );
};
