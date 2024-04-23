import React, {
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { LookupMenu } from "./userLookup";
import { Dialog } from "./dialog";
import { GlobalContext } from "../types/global";
import { LoginTriplet } from "../types/loginTriplet";
import { DetailedIp } from "./detailedIp";

interface CidLookupProps extends PropsWithChildren {
  initialCid?: string;
}

export const CidLookup: React.FC<CidLookupProps> = (props: CidLookupProps) => {
  const { initialCid } = props;

  const [cid, setCid] = useState<string>("");
  const [ipData, setCidData] = useState<LoginTriplet[] | null>(null);

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
        <label htmlFor="cid">CID: </label>
        <input
          type="text"
          id="cid"
          name="cid"
          value={cid}
          onInput={(event) => {
            const target = event.target as HTMLInputElement;
            setCid(target.value);
          }}
        ></input>
      </form>

      {loading && <div className="text-2xl">Loading...</div>}
      {ipData && <CidData triplets={ipData} />}
    </>
  );
};

const CidData = (props: { triplets: LoginTriplet[] }) => {
  return (
    <div className="flex flex-col border-white border p-5 m-3 gap-1 max-h-[800px] overflow-scroll">
      {props.triplets.map((triplet) => (
        <div key={triplet.id}>
          {triplet.loginDate}: <NameExpand name={triplet.ckey} /> -{" "}
          <DetailedIp
            ip={`${triplet.ip1}.${triplet.ip2}.${triplet.ip3}.${triplet.ip4}`}
          />
        </div>
      ))}
    </div>
  );
};

const NameExpand = (props: { name: string }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className="cursor-pointer text-blue-600 inline"
      >
        {props.name}
      </div>
      {open && (
        <Dialog open={open} toggle={() => setOpen(false)} className="md:w-3/4">
          <LookupMenu initialUser={props.name} />
        </Dialog>
      )}
    </>
  );
};
