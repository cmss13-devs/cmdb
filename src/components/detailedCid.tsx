import React, { useState } from "react";
import { Dialog } from "./dialog";
import { CidLookup } from "./cidLookup";
import { Link } from "./link";

type DetailedCidProps = {
  cid: string;
};

export const DetailedCid: React.FC<DetailedCidProps> = (
  props: DetailedCidProps
) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Link onClick={() => setOpen(true)} className="inline">
        {props.cid}
      </Link>
      {open && (
        <Dialog open={open} toggle={() => setOpen(false)}>
          <CidLookup initialCid={props.cid} />
        </Dialog>
      )}
    </>
  );
};
