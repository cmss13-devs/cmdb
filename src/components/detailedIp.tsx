import React, { useState } from "react";
import { Dialog } from "./dialog";
import { IpLookup } from "./ipLookup";

type DetailedIpProps = {
  ip: string;
};

export const DetailedIp: React.FC<DetailedIpProps> = (
  props: DetailedIpProps
) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className="cursor-pointer inline text-blue-600"
      >
        {props.ip}
      </div>
      {open && (
        <Dialog open={open} toggle={() => setOpen(false)}>
          <IpLookup initialIp={props.ip} />
        </Dialog>
      )}
    </>
  );
};
