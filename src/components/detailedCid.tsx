import React, { useState } from "react";
import { Dialog } from "./dialog";
import { CidLookup } from "./cidLookup";

type DetailedCidProps = {
  cid: string;
};

export const DetailedCid: React.FC<DetailedCidProps> = (
  props: DetailedCidProps
) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className="cursor-pointer inline text-blue-600"
      >
        {props.cid}
      </div>
      {open && (
        <Dialog open={open} toggle={() => setOpen(false)}>
          <CidLookup initialCid={props.cid} />
        </Dialog>
      )}
    </>
  );
};
