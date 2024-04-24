import React, { useState } from "react";
import { Dialog } from "./dialog";
import { LookupMenu } from "./userLookup";

interface NameExpandProps {
  name: string;
}

export const NameExpand: React.FC<NameExpandProps> = (
  props: NameExpandProps
) => {
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
