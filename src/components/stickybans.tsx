import React, { useEffect, useState } from "react";
import { Link } from "./link";
import { Dialog } from "./dialog";

type Stickyban = {
  id: number;
  identifier: string;
  reason: string;
  message: string;
  date: string;
  active: boolean;
  adminId?: number;
  adminCkey?: string;
};

export const StickybansModal: React.FC<Record<string, never>> = () => {
  const [stickybanData, setStickybanData] = useState<Stickyban[] | null>(null);

  useEffect(() => {
    if (!stickybanData) {
      fetch(`${import.meta.env.VITE_API_PATH}/Stickyban`).then((value) =>
        value.json().then((json) => setStickybanData(json))
      );
    }
  });

  if (!stickybanData) {
    return <div className="flex flex-row justify-center">Loading...</div>;
  }

  return (
    <div className="pt-10">
      <div className="overflow-scroll max-h-[800px]">
        <table>
          <tbody>
            <tr>
              <th>Identifier</th>
              <th>Message</th>
              <th>Reason</th>
              <th>Actions</th>
            </tr>
            {stickybanData.map((stickyban) => (
              <StickybanEntry stickyban={stickyban} key={stickyban.id} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const StickybanEntry = (props: { stickyban: Stickyban }) => {
  const { stickyban } = props;

  return (
    <tr>
      <td className="border p-2">{stickyban.identifier}</td>
      <td className="border p-2">{stickyban.message}</td>
      <td className="border p-2">{stickyban.reason.trim()}</td>
      <td className="border p-2">
        <ExpandDetails stickyban={stickyban} />
      </td>
    </tr>
  );
};

type StickybansMatchedCid = {
  id: number;
  cid: string;
  linkedStickyban: number;
};

type StickybansMatchedCkey = {
  id: number;
  ckey: string;
  linkedStickyban: number;
  whitelisted: boolean;
};

type StickybansMatchedIp = {
  id: number;
  ip: string;
  linkedStickyban: number;
};

const ExpandDetails = (props: { stickyban: Stickyban }) => {
  const { stickyban } = props;

  const [cids, setCids] = useState<StickybansMatchedCid[] | null>(null);
  const [ckeys, setCkeys] = useState<StickybansMatchedCkey[] | null>(null);
  const [ips, setIps] = useState<StickybansMatchedIp[] | null>(null);

  const [open, setOpen] = useState(false);

  const check = () => {
    setOpen(true);

    fetch(
      `${import.meta.env.VITE_API_PATH}/Stickyban/Cid?id=${stickyban.id}`
    ).then((value) =>
      value.json().then((json) => {
        setCids(json);
      })
    );

    fetch(
      `${import.meta.env.VITE_API_PATH}/Stickyban/Ckey?id=${stickyban.id}`
    ).then((value) =>
      value.json().then((json) => {
        setCkeys(json);
      })
    );

    fetch(
      `${import.meta.env.VITE_API_PATH}/Stickyban/Ip?id=${stickyban.id}`
    ).then((value) =>
      value.json().then((json) => {
        setIps(json);
      })
    );
  };

  return (
    <>
      <Link onClick={() => check()}>Details</Link>
      {open && (
        <Dialog open={!!cids} toggle={() => setOpen(false)}>
          <div className="flex flex-col pt-10">
            <div>CIDs: {cids && cids.map((cid) => cid.cid).join(", ")}</div>
            <div>
              CKEYs: {ckeys && ckeys.map((ckey) => ckey.ckey).join(", ")}
            </div>
            <div>IPs: {ips && ips.map((ip) => ip.ip).join(", ")}</div>
          </div>
        </Dialog>
      )}
    </>
  );
};
