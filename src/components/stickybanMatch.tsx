import React, { useEffect, useState } from "react";
import { Stickyban } from "../types/stickyban";
import { Link } from "./link";
import { Dialog } from "./dialog";
import { StickybanModal } from "./stickybanModal";

export const StickybanMatch: React.FC<StickybanMatch> = (
  props: StickybanMatch
) => {
  const [stickyData, setStickyData] = useState<Stickyban[] | null>(null);
  const [open, setOpen] = useState(false);

  const { ip, ckey, cid } = props;

  const getPath = () => {
    if (ip) return `/Stickyban/Ip?ip=${ip}`;
    if (ckey) return `/Stickyban/Ckey?ckey=${ckey}`;
    if (cid) return `/Stickyban/Cid?cid=${cid}`;
  };

  const getText = () => {
    if (ip) return "IP";
    if (ckey) return "CKEY";
    if (cid) return "CID";
  };

  useEffect(() => {
    if (!stickyData) {
      fetch(`${import.meta.env.VITE_API_PATH}${getPath()}`).then((value) =>
        value.json().then((json) => setStickyData(json))
      );
    }
  });

  if (!stickyData?.length) return;

  return (
    <>
      <div className="red-alert-bg p-3 h-full">
        <div className="foreground p-3 h-full flex flex-col justify-center">
          <Link onClick={() => setOpen(true)}>
            {getText()} has active stickybans.
          </Link>
        </div>
      </div>
      {open && (
        <Dialog toggle={() => setOpen(false)} open={open}>
          <StickybanModal stickybans={stickyData} />
        </Dialog>
      )}
    </>
  );
};

type StickybanMatch = {
  ip?: string;
  ckey?: string;
  cid?: string;
};
