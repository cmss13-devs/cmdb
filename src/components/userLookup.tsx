import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import React from "react";
import { GlobalContext } from "../types/global";
import { DetailedCid } from "./detailedCid";
import { DetailedIp } from "./detailedIp";
import { ConnectionHistory } from "../types/loginTriplet";
import { Dialog } from "./dialog";
import { TripletList } from "./tripletsList";
import { LinkColor } from "./link";
import { Expand } from "./expand";
import { StickybanMatch } from "./stickybanMatch";
import { callApi } from "../helpers/api";
import { useLoaderData, useNavigate } from "react-router-dom";
import { NameExpand } from "./nameExpand";
import { Ticket } from "../types/ticket";
import { TicketModal } from "./ticketmodal";

type ActiveLookupType = {
  updateUser: (_args: UpdateUserArguments) => void;
};

const ActiveLookupContext = createContext<ActiveLookupType | null>(null);

interface LookupMenuProps extends PropsWithChildren {
  value?: string;
  discordId?: string;
  close?: () => void;
}

type UpdateUserArguments = {
  userCkey?: string;
  userDiscordId?: string;
};

export const LookupMenu: React.FC<LookupMenuProps> = (
  props: LookupMenuProps
) => {
  const [user, setUser] = useState<string>("");
  const [userData, setUserData] = useState<Player | null>(null);
  const [loading, setLoading] = useState(false);
  const global = useContext(GlobalContext);

  const { value, discordId, close } = props;

  const updateUser = useCallback(
    (args: UpdateUserArguments) => {
      const { userCkey, userDiscordId } = args;
      setLoading(true);
      const re = /[\\^]|[^a-z0-9@]/g;
      const userCkeyChecked = userCkey?.toLowerCase().replace(re, "");
      callApi(
        userCkeyChecked
          ? `/User?ckey=${userCkeyChecked}`
          : `/User?discord_id=${userDiscordId}`
      ).then((value) => {
        if (value.status == 404) {
          global?.updateAndShowToast("Failed to find user.");
          if (close) {
            close();
          }
        } else {
          value.json().then((json) => {
            setLoading(false);
            setUserData(json);
          });
        }
      });
    },
    [setLoading, setUserData, close, global]
  );

  const potentialUser = useLoaderData() as string;

  useEffect(() => {
    if (loading) return;

    if (discordId && !userData) {
      updateUser({ userDiscordId: discordId });
      return;
    }
    if (value && !userData) {
      updateUser({ userCkey: value });
      return;
    }

    if (!potentialUser) return;

    const re = /[\\^]|[^a-z0-9@]/g;
    const checked = potentialUser.toLowerCase().replace(re, "");

    if (potentialUser && (!userData || userData.ckey != checked)) {
      updateUser({ userCkey: potentialUser as string });
    }
  }, [value, userData, discordId, updateUser, potentialUser, user, loading]);

  const nav = useNavigate();

  return (
    <ActiveLookupContext.Provider value={{ updateUser: updateUser }}>
      {!value && !discordId && (
        <form
          className="flex flex-row justify-center gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            nav(`/user/${user}`);
          }}
        >
          <label htmlFor="ckey">User: </label>
          <input
            type="text"
            id="ckey"
            name="ckey"
            value={user}
            onInput={(event) => {
              const target = event.target as HTMLInputElement;
              setUser(target.value);
            }}
          ></input>
        </form>
      )}

      {loading && <div className="text-xl text-center">Loading...</div>}

      {userData && <UserModal player={userData} />}
    </ActiveLookupContext.Provider>
  );
};

interface Player {
  id: number;
  ckey: string;
  lastLogin: string;
  isPermabanned: boolean;
  permabanReason?: string;
  permabanDate?: string;
  isTimeBanned: boolean;
  timeBanReason?: string;
  timeBanAdminId?: number;
  timeBanDate?: string;
  lastKnownIp: string;
  lastKnownCid: string;
  timeBanExpiration?: number;
  migratedNotes: boolean;
  migratedBans: boolean;
  permabanAdminId?: number;
  stickybanWhitelisted?: boolean;
  discordLinkId?: number;
  whitelistStatus?: string;
  byondAccountAge?: string;
  firstJoinDate?: string;
  notes?: PlayerNote[];
  jobBans?: PlayerJobBan[];
  permabanAdminCkey?: string;
  timeBanAdminCkey?: string;
  discordId?: number;
}

const UserModal = (props: { player: Player }) => {
  const { player } = props;

  const { ckey } = player;

  return (
    <div className="flex flex-col gap-3">
      <div className="text-center text-2xl underline">{ckey}</div>

      <div className="flex flex-col md:flex-row justify-center gap-2">
        <IsBannedModal player={player} />
        <div>
          <StickybanMatch ckey={player.ckey} />
        </div>
      </div>

      {import.meta.env.VITE_USE_ACTIONS && (
        <PlayerActionsModal player={player} />
      )}

      <UserDetailsModal player={player} />

      <div className="flex flex-row">
        <div className="flex flex-col gap-3 grow">
          <UserNotesModal player={player} />
          <UserJobBansModal player={player} />
        </div>
      </div>
    </div>
  );
};

const IsBannedModal = (props: { player: Player }) => {
  const { player } = props;
  const {
    isPermabanned,
    permabanDate,
    permabanReason,
    permabanAdminCkey,
    isTimeBanned,
    timeBanDate,
    timeBanReason,
    timeBanAdminCkey,
    timeBanExpiration,
  } = player;

  if (isPermabanned) {
    return (
      <div className="red-alert-bg p-3">
        <div className="foreground p-2">
          <div className="text-2xl">PERMABANNED</div>
          <div>Placed: {permabanDate}</div>
          <div>Reason: {permabanReason}</div>
          <div>By: {permabanAdminCkey}</div>
        </div>
      </div>
    );
  }

  if (isTimeBanned && timeBanExpiration) {
    const byondEpoch = Date.parse("01 Jan 2000 00:00:00 GMT");
    const approxUnban = byondEpoch + timeBanExpiration * 60000;

    if (Date.now() > approxUnban) {
      return;
    }

    const unbanDate = new Date(approxUnban).toString();

    return (
      <div className="purple-alert-bg p-3">
        <div className="foreground p-2">
          <div className="text-2xl">TEMPBANNED</div>
          <div>
            Placed: {timeBanDate} Expires: {unbanDate}
          </div>
          <div>Reason: {timeBanReason}</div>
          <div>By: {timeBanAdminCkey}</div>
        </div>
      </div>
    );
  }
};

const PlayerActionsModal = (props: { player: Player }) => {
  const { player } = props;

  return (
    <div className="flex flex-row gap-3 justify-center">
      <PermaBanButton player={player} />
      <TimeBanButton player={player} />
    </div>
  );
};

const PermaBanButton = (props: { player: Player }) => {
  const { isPermabanned } = props.player;

  if (isPermabanned) {
    return (
      <div className="cursor-pointer red-alert-bg p-3">
        <div className="foreground p-3">Remove Permaban</div>
      </div>
    );
  }

  return (
    <div className="cursor-pointer red-alert-bg p-3">
      <div className="foreground p-3">Permaban User</div>
    </div>
  );
};

const TimeBanButton = (props: { player: Player }) => {
  const { isTimeBanned } = props.player;

  if (isTimeBanned) {
    return (
      <div className="cursor-pointer purple-alert-bg p-3">
        <div className="foreground p-3">Remove Timeban</div>
      </div>
    );
  }

  return (
    <div className="cursor-pointer purple-alert-bg p-3">
      <div className="foreground p-3">Time Ban User</div>
    </div>
  );
};

const UserDetailsModal = (props: { player: Player }) => {
  const { player } = props;

  const {
    lastLogin,
    lastKnownCid,
    lastKnownIp,
    byondAccountAge,
    firstJoinDate,
    discordId,
    ckey,
  } = player;

  const global = useContext(GlobalContext);

  const [tickets, setViewTickets] = useState(false);

  useEffect(() => {
    setViewTickets(false);
  }, [player, setViewTickets]);

  return (
    <>
      <div className="flex flex-col items-center md:items-start md:flex-row gap-3 justify-center">
        <div className="flex flex-row gap-3">
          <div className="underline">
            <div>Last Seen:</div>
            <div>Last Known CID:</div>
            <div>Last Known IP:</div>
          </div>

          <div>
            <div>{lastLogin}</div>
            <div>
              <DetailedCid cid={lastKnownCid} />
            </div>
            <div>
              <DetailedIp ip={lastKnownIp} />
            </div>
          </div>
        </div>

        <div className="flex flex-row gap-3">
          <div className="underline">
            <div>BYOND Account Age:</div>
            <div>First Join Date:</div>
            <div>Discord ID:</div>
          </div>

          <div>
            <div>{byondAccountAge ?? "Unknown"}</div>
            <div>{firstJoinDate ?? "Unknown"}</div>
            {discordId ? (
              <LinkColor
                onClick={() => {
                  global?.updateAndShowToast("Copied to clipboard.");
                  navigator.clipboard.writeText(`${discordId}`);
                }}
              >
                {discordId}
              </LinkColor>
            ) : (
              <div>Not Linked</div>
            )}
          </div>
        </div>
        <div className="flex flex-col">
          <ConnectionType
            label={"View Full Connection History"}
            path={"/Connections/Ckey?ckey="}
            value={ckey}
          />
          <ConnectionType
            label={"View Full Connections By All CIDs"}
            path={"/Connections/FullByAllCid?ckey="}
            value={ckey}
          />
          <ConnectionType
            label={"View Full Connections By All IPs"}
            path={"/Connections/FullByAllIps?ckey="}
            value={ckey}
          />
        </div>
      </div>
      <div className="flex flex-col">
        <div className="flex flex-row justify-center gap-2">
          {player.whitelistStatus && (
            <>
              <Expand
                value={player.whitelistStatus.split("|").join("\n")}
                label="View Role Whitelists"
              />
              {"|"}
            </>
          )}
          <LinkColor onClick={() => setViewTickets(true)}>
            View Tickets
          </LinkColor>
          {tickets && (
            <Dialog open={tickets} toggle={() => setViewTickets(false)}>
              <div className="pt-5">
                <UserTickets ckey={player.ckey} />
              </div>
            </Dialog>
          )}
        </div>
      </div>
    </>
  );
};

const UserTickets = (props: { ckey: string }) => {
  const [tickets, setTicketData] = useState<Ticket[] | undefined>();
  const [page, setPage] = useState(1);
  const [activePage, setActivePage] = useState(1);
  const [errored, setErrored] = useState(false);

  const glob = useContext(GlobalContext);

  useEffect(() => {
    if (page != activePage) {
      setTicketData(undefined);
    }
    if (!tickets && !errored) {
      callApi(`/Ticket/User/${props.ckey}/?page=${page}`).then((value) => {
        if (value.status != 200) {
          glob?.updateAndShowToast("No more tickets.");
          if (page == 1) {
            setErrored(true);
          } else {
            setPage(1);
          }
          return;
        }

        value.json().then((json) => {
          setTicketData(json);
          setActivePage(page);
        });
      });
    }
  }, [
    tickets,
    setTicketData,
    page,
    setPage,
    props,
    activePage,
    setActivePage,
    glob,
    errored,
  ]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row justify-center gap-3">
        {page > 1 && (
          <LinkColor
            className="text-xl"
            onClick={() => setPage((x) => Math.max(x - 1, 1))}
          >
            {"<-"}
          </LinkColor>
        )}
        <div>Page {page}</div>
        <LinkColor className="text-xl" onClick={() => setPage((x) => x + 1)}>
          {"->"}
        </LinkColor>
      </div>
      {tickets && <TicketModal tickets={tickets} />}
      {!tickets && !errored && (
        <div className="flex flex-row justify-center">Waiting...</div>
      )}
      {errored && (
        <div className="flex flex-row justify-center">No tickets for user.</div>
      )}
    </div>
  );
};

const ConnectionType = (props: {
  label: string;
  path: string;
  value: string;
}) => {
  const [open, setOpen] = useState(false);

  const { path, value, label } = props;

  return (
    <>
      <LinkColor onClick={() => setOpen(true)}>{label}</LinkColor>
      {open && (
        <Dialog
          open={open}
          toggle={() => setOpen(false)}
          className="min-h-11/12"
        >
          <ConnectionTypeDetails path={path} value={value} />
        </Dialog>
      )}
    </>
  );
};

const ConnectionTypeDetails = (props: {
  path: string;
  value: string;
  viewCkeys?: boolean;
  viewCids?: boolean;
  viewIps?: boolean;
}) => {
  const [connectionData, setConnectionData] =
    useState<ConnectionHistory | null>(null);

  const { path, value } = props;

  useEffect(() => {
    if (!connectionData) {
      callApi(`${path}${value}`).then((value) =>
        value.json().then((json) => setConnectionData(json))
      );
    }
  }, [connectionData, path, value]);

  if (!connectionData) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-row justify-center gap-1">
        {!!connectionData.allCkeys && (
          <Expand
            label={"View All CKEYs"}
            value={connectionData.allCkeys.join(", ")}
          />
        )}
        {!!connectionData.allCkeys && !!connectionData.allCids && <div>-</div>}
        {!!connectionData.allCids && (
          <Expand
            label={"View All CIDs"}
            value={connectionData.allCids.join(", ")}
          />
        )}
        {!!connectionData.allCids && !!connectionData.allIps && <div>-</div>}
        {!!connectionData.allIps && (
          <Expand
            label={"View All IPs"}
            value={connectionData.allIps.join(", ")}
          />
        )}
      </div>
      {connectionData.triplets && (
        <TripletList triplets={connectionData.triplets} />
      )}
    </div>
  );
};

interface PlayerNote {
  id: number;
  playerId: number;
  adminId: number;
  text?: string;
  date: string;
  isBan: boolean;
  banTime?: number;
  isConfidential: boolean;
  adminRank: string;
  noteCategory?: number;
  roundId?: number;
  notedPlayerCkey?: string;
  notingAdminCkey?: string;
}

const UserNotesModal = (props: { player: Player }) => {
  const { player } = props;

  const { notes } = player;

  return (
    <div className="flex flex-col">
      <div className="flex flex-row gap-3">
        <div className="text-2xl">Notes:</div>
        <div className="flex flex-col justify-center">
          <div className="flex flex-row gap-1">
            <AddNote player={player} />
            |
            <ViewAppliedNotes player={player} />
          </div>
        </div>
      </div>
      <NotesList notes={notes} />
    </div>
  );
};

const NotesList = (props: { notes?: PlayerNote[]; displayNoted?: boolean }) => {
  const { notes, displayNoted } = props;

  return (
    <div className="border-[#3f3f3f] border-2 p-3 flex flex-col gap-3 h-96 overflow-auto">
      {notes
        ?.filter((note) => note.text)
        .map((note) => (
          <UserNote note={note} key={note.id} displayNoted={displayNoted} />
        ))}
      {!notes ||
        (!notes.length && (
          <div className="flex flex-row justify-center">No notes..</div>
        ))}
    </div>
  );
};

const ViewAppliedNotes = (props: { player: Player }) => {
  const [notes, setNotes] = useState<PlayerNote[] | null>();

  const { player } = props;

  const openDialog = () => {
    callApi(`/User/${player.id}/AppliedNotes`).then((val) =>
      val.json().then((json) => setNotes(json))
    );
  };

  return (
    <>
      <LinkColor onClick={() => openDialog()}>View Applied Notes</LinkColor>
      {notes && (
        <Dialog open={!!notes} toggle={() => setNotes(null)}>
          <div className="pt-10">
            <NotesList notes={notes} displayNoted={true} />
          </div>
        </Dialog>
      )}
    </>
  );
};

const AddNote = (props: { player: Player }) => {
  const [adding, setAdding] = useState(false);

  const [message, setMessage] = useState("");
  const [confidential, setConfidential] = useState(false);

  const [confirm, setConfirm] = useState(false);

  const { player } = props;

  const { ckey } = player;

  const global = useContext(GlobalContext);
  const refetch = useContext(ActiveLookupContext);

  const send = () => {
    callApi(`/User/${player.id}/Note`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        Message: message,
        Category: "1",
        Confidential: confidential ? "true" : "false",
      }),
    }).then((response) => {
      response.text().then((response) => {
        refetch?.updateUser({ userCkey: ckey });
        setAdding(false);
        if (response) {
          global?.updateAndShowToast(`Added note to ${ckey}.`);
        } else {
          global?.updateAndShowToast(`Failed to add note.`);
        }
      });
    });
  };

  return (
    <>
      <LinkColor onClick={() => setAdding(true)}>Add Note</LinkColor>
      {adding && (
        <Dialog toggle={() => setAdding(false)} open={adding}>
          <form className="pt-10">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col lg:flex-row justify-center gap-3">
                <div className="flex flex-col">
                  <label
                    className="flex flex-row justify-center"
                    htmlFor="message"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    className="max-w-full box-border"
                    cols={70}
                    rows={5}
                    onChange={(event) => {
                      setMessage(event.target.value);
                    }}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="flex flex-row justify-center">
                    Confidential
                  </label>
                  <input
                    type="checkbox"
                    onChange={() => setConfidential(!confidential)}
                  />
                </div>
              </div>
              <div className="flex flex-row justify-center">
                {!confirm ? (
                  <LinkColor onClick={() => setConfirm(true)}>Submit</LinkColor>
                ) : (
                  <LinkColor onClick={() => send()} className="text-red-700">
                    Confirm
                  </LinkColor>
                )}
              </div>
            </div>
          </form>
        </Dialog>
      )}
    </>
  );
};

const NOTE_MERIT = 2;
const NOTE_WHITELIST = 3;

const UserNote = (props: { note: PlayerNote; displayNoted?: boolean }) => {
  const { note, displayNoted } = props;
  const {
    text,
    date,
    isConfidential,
    adminRank,
    isBan,
    noteCategory,
    notedPlayerCkey,
    notingAdminCkey,
  } = note;

  let tag = <ColoredText color="#008800">[ADMIN]</ColoredText>;

  switch (noteCategory) {
    case NOTE_MERIT:
      tag = <ColoredText color="#9e3dff">[MERIT]</ColoredText>;
      break;
    case NOTE_WHITELIST:
      tag = <ColoredText color="#324da5">[WHITELIST]</ColoredText>;
      break;
  }

  if (isBan) {
    tag = <ColoredText color="#880000">[BAN]</ColoredText>;
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-col md:flex-row gap-1">
        {tag}
        <div className="text-wrap">{text}</div>
      </div>
      <div className="italic flex flex-row justify-end gap-1">
        {displayNoted && (
          <div>
            to
            <NameExpand name={notedPlayerCkey} />
          </div>
        )}
        {"by"}
        <NameExpand name={notingAdminCkey} /> ({adminRank})
        {!!isConfidential && "[CONFIDENTIALLY]"} on {date}
      </div>
    </div>
  );
};

interface ColoredTextType extends PropsWithChildren {
  color: string;
}

const ColoredText = (props: ColoredTextType) => {
  return <div style={{ color: props.color }}>{props.children}</div>;
};

interface PlayerJobBan {
  id: number;
  playerId: number;
  adminId: number;
  text: string;
  date: string;
  banTime?: number;
  expiration?: number;
  role: string;
  banningAdminCkey?: string;
}

const UserJobBansModal = (props: { player: Player }) => {
  const { player } = props;

  const { jobBans } = player;

  return (
    <div className="flex flex-col">
      <div className="text-2xl">Job Bans:</div>
      <div className="border-[#3f3f3f] border-2 p-3 flex flex-col gap-3">
        {jobBans?.map((jobBan) => (
          <JobBan jobBan={jobBan} key={jobBan.id} />
        ))}
        {!jobBans?.length && (
          <div className="flex flex-row justify-center">No job bans.</div>
        )}
      </div>
    </div>
  );
};

const JobBan = (props: { jobBan: PlayerJobBan }) => {
  const { text, banningAdminCkey, date, role } = props.jobBan;

  return (
    <div className="flex flex-col">
      <div>
        {role.toUpperCase()} - {text}
      </div>
      <div className="flex flex-row justify-end italic">
        by {banningAdminCkey} on {date}
      </div>
    </div>
  );
};
