import React, { useState } from "react";
import { Link } from "./link";
import { Dialog } from "./dialog";

type ExpandProps = {
  label: string;
  value: string;
};

export const Expand: React.FC<ExpandProps> = (props: ExpandProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Link onClick={() => setOpen(true)}>{props.label}</Link>
      {open && (
        <Dialog open={open} toggle={() => setOpen(false)}>
          <div className="pt-10">{props.value}</div>
        </Dialog>
      )}
    </>
  );
};
