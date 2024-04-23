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
import { DetailedCid } from "./detailedCid";

interface IpLookupProps extends PropsWithChildren {
  initialIp?: string;
}

export const IpLookup: React.FC<IpLookupProps> = (props: IpLookupProps) => {
  const { initialIp } = props;

  const [ip, setIp] = useState<string>("");
  const [ipData, setIpData] = useState<LoginTriplet[] | null>(null);

  const [loading, setLoading] = useState(false);

  const global = useContext(GlobalContext);

  useEffect(() => {
    if (initialIp && !ipData) {
      updateIp(initialIp);
    }
  });

  const updateIp = (override?: string) => {
    setLoading(true);
    if (override) {
      setIp(override);
    }
    fetch(
      `${import.meta.env.VITE_API_PATH}/Connections/Ip?ip=${
        override ? override : ip
      }`
    ).then((value) =>
      value.json().then((json) => {
        setLoading(false);
        if (json.status == 404) {
          global?.updateAndShowToast("No connections by IP.");
        } else {
          setIpData(json);
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
          updateIp();
        }}
      >
        <label htmlFor="ip">IP: </label>
        <input
          type="text"
          id="ip"
          name="ip"
          value={ip}
          onInput={(event) => {
            const target = event.target as HTMLInputElement;
            setIp(target.value);
          }}
        ></input>
      </form>

      {loading && <div className="text-2xl">Loading...</div>}
      {ipData && <IpData triplets={ipData} />}
    </>
  );
};

const IpData = (props: { triplets: LoginTriplet[] }) => {
  return (
    <div className="flex flex-col border-white border p-5 m-3 gap-1 max-h-[800px] overflow-scroll">
      {props.triplets.map((triplet) => (
        <div key={triplet.id}>
          {triplet.loginDate}: <NameExpand name={triplet.ckey} /> -{" "}
          <DetailedCid cid={triplet.lastKnownCid} />
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
