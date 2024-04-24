import React, { useState } from "react";
import { Dialog } from "./dialog";
import { LookupMenu } from "./userLookup";
import { Link } from "./link";

interface NameExpandProps {
  name: string;
}

export const NameExpand: React.FC<NameExpandProps> = (
  props: NameExpandProps
) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Link onClick={() => setOpen(true)} className="inline">
        {props.name}
      </Link>
      {open && (
        <Dialog open={open} toggle={() => setOpen(false)} className="md:w-5/6">
          <LookupMenu value={props.name} />
        </Dialog>
      )}
    </>
  );
};
