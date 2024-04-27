import React, { useState } from "react";
import {
  Stickyban,
  StickybansMatchedCid,
  StickybansMatchedCkey,
  StickybansMatchedIp,
} from "../types/stickyban";
import { Link } from "./link";
import { Dialog } from "./dialog";
import { callApi } from "../helpers/api";

type StickybanModalProps = {
  stickybans: Stickyban[];
};

export const StickybanModal: React.FC<StickybanModalProps> = (
  props: StickybanModalProps
) => {
  const { stickybans } = props;

  return (
    <div className="pt-10">
      <div className="overflow-auto max-h-[800px]">
        <table className="w-full">
          <tbody>
            <tr>
              <th>Identifier</th>
              <th>Message</th>
              <th>Reason</th>
              <th>Admin</th>
              <th>Actions</th>
            </tr>
            {stickybans.map((stickyban) => (
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
    <tr className={`${stickyban.active ? "" : "text-gray-500"}`}>
      <td className="border p-2">{stickyban.identifier}</td>
      <td className="border p-2">{stickyban.message}</td>
      <td className="border p-2">{stickyban.reason.trim()}</td>
      <td className="border p-2">{stickyban.adminCkey ?? "AdminBot"}</td>
      <td className="border p-2">
        <ExpandDetails stickyban={stickyban} />
      </td>
    </tr>
  );
};

const ExpandDetails = (props: { stickyban: Stickyban }) => {
  const { stickyban } = props;

  const [cids, setCids] = useState<StickybansMatchedCid[] | null>(null);
  const [ckeys, setCkeys] = useState<StickybansMatchedCkey[] | null>(null);
  const [ips, setIps] = useState<StickybansMatchedIp[] | null>(null);

  const [open, setOpen] = useState(false);

  const check = () => {
    setOpen(true);

    callApi(`/Stickyban/${stickyban.id}/Match/Cid`).then((value) =>
      value.json().then((json) => {
        setCids(json);
      })
    );

    callApi(`/Stickyban/${stickyban.id}/Match/Ckey`).then((value) =>
      value.json().then((json) => {
        setCkeys(json);
      })
    );

    callApi(`/Stickyban/${stickyban.id}/Match/Ip`).then((value) =>
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
          <div className="flex flex-col gap-2 pt-10">
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
