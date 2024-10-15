import React, {
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { Stickyban } from "../types/stickyban";
import { LinkColor } from "./link";
import { Dialog } from "./dialog";
import { StickybanModal } from "./stickybanModal";
import { GlobalContext } from "../types/global";
import { callApi } from "../helpers/api";
import { offset, useFloating } from "@floating-ui/react";

export const StickybanMatch: React.FC<StickybanMatch> = (
  props: StickybanMatch
) => {
  const [stickyData, setStickyData] = useState<Stickyban[] | null>(null);
  const [open, setOpen] = useState(false);

  const { ip, ckey, cid } = props;

  const getPath = () => {
    if (ip) return `/Stickyban/Ip?ip=${ip}`;
    if (ckey) return `/Stickyban/Ckey?ckey=${ckey}`;
    return `/Stickyban/Cid?cid=${cid}`;
  };

  const getText = () => {
    if (ip) return "IP";
    if (ckey) return "CKEY";
    if (cid) return "CID";
  };

  useEffect(() => {
    if (!stickyData) {
      callApi(getPath()).then((value) =>
        value.json().then((json) => setStickyData(json))
      );
    }
  });

  if (!stickyData?.length) return;

  return (
    <>
      <div className="red-alert-bg p-3 h-full">
        <div className="foreground p-3 h-full flex flex-col justify-center">
          <div className="flex flex-row gap-3">
            <div className="flex flex-col justify-center">
              <LinkColor onClick={() => setOpen(true)}>
                {getText()} has active stickybans.
              </LinkColor>
            </div>
            {ckey && (
              <Tooltip
                tooltip={
                  "This will whitelist the user against all matching stickybans."
                }
              >
                <Whitelist ckey={ckey} />
              </Tooltip>
            )}
          </div>
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

const Whitelist = (props: { ckey: string }) => {
  const [open, setOpen] = useState(false);

  const { ckey } = props;

  const global = useContext(GlobalContext);

  const doWhitelist = () => {
    callApi(`/Stickyban/Whitelist?ckey=${ckey}`, {
      method: "POST",
    }).then((value) => {
      value.text().then((value) => {
        setOpen(false);
        if (value) {
          global?.updateAndShowToast(
            `Whitelisted ${ckey} against ${value} stickybans.`
          );
        } else {
          global?.updateAndShowToast(`No stickybans lifted for ${ckey}.`);
        }
      });
    });
  };

  return (
    <>
      <LinkColor
        onClick={() => setOpen(true)}
        className="p-2 border border-white border-dashed"
      >
        Whitelist?
      </LinkColor>
      {open && (
        <Dialog open={open} toggle={() => setOpen(false)}>
          <div className="flex flex-col">
            <div className="pt-10 flex flex-row justify-center">
              Confirm whitelisting {ckey}?
            </div>
            <LinkColor
              onClick={() => doWhitelist()}
              className="flex flex-row justify-center"
            >
              Whitelist
            </LinkColor>
          </div>
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

interface TooltipProps extends PropsWithChildren {
  tooltip: string;
}

const Tooltip = (props: TooltipProps) => {
  const [hovered, setHovered] = useState(false);

  const { refs, floatingStyles } = useFloating({
    placement: "top",
    middleware: [offset(5)],
  });

  return (
    <>
      {hovered && (
        <div
          ref={refs.setFloating}
          style={floatingStyles}
          className="foreground border-white border"
        >
          {props.tooltip}
        </div>
      )}
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        ref={refs.setReference}
      >
        {props.children}
      </div>
    </>
  );
};
