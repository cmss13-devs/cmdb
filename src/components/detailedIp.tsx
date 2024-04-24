import React, { useState } from "react";
import { Dialog } from "./dialog";
import { IpLookup } from "./ipLookup";
import { Link } from "./link";

type DetailedIpProps = {
  ip: string;
};

export const DetailedIp: React.FC<DetailedIpProps> = (
  props: DetailedIpProps
) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Link onClick={() => setOpen(true)} className="inline">
        {props.ip}
      </Link>
      {open && (
        <Dialog open={open} toggle={() => setOpen(false)}>
          <IpLookup initialIp={props.ip} />
        </Dialog>
      )}
    </>
  );
};
