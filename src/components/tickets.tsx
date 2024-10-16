import React, { useCallback, useContext, useEffect, useState } from "react";
import { callApi } from "../helpers/api";
import { Round } from "../types/rounds";
import { LinkColor } from "./link";
import { Ticket, TicketLoader } from "../types/ticket";
import { Dialog } from "./dialog";
import { NameExpand } from "./nameExpand";
import { GlobalContext } from "../types/global";
import { Link, useLoaderData, useNavigate } from "react-router-dom";

export const Tickets: React.FC = () => {
  const [lookupRound, setLookupRound] = useState<number | undefined>();

  const [acquiredData, setAcquiredData] = useState<Ticket[] | undefined>();

  const [loading, setLoading] = useState(false);

  const global = useContext(GlobalContext);

  const updateLookup = useCallback(
    (id?: number) => {
      const round = id || lookupRound;
      setLookupRound(round);
      if (!round) return;

      setLoading(true);

      callApi(`/Ticket/${round}`).then((value) => {
        if (value.status == 404) {
          global?.updateAndShowToast(
            "No tickets found or the provided round ID."
          );
        } else {
          value.json().then((json) => {
            setAcquiredData(json);
          });
        }
        setLoading(false);
      });
    },
    [setLookupRound, setAcquiredData, global, lookupRound]
  );

  const { round } = useLoaderData() as TicketLoader;

  useEffect(() => {
    if (round && parseInt(round) != lookupRound) {
      setAcquiredData(undefined);
    }
    if (round && !acquiredData) {
      updateLookup(parseInt(round as string));
    }
  }, [lookupRound, round, acquiredData, updateLookup]);

  return (
    <div className="flex flex-col gap-3">
      <RecentRounds />
      <form
        className="flex flex-row justify-center gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          updateLookup();
        }}
      >
        <label htmlFor="round">Round: </label>
        <input
          type="number"
          id="round"
          name="round"
          onInput={(event) => {
            const target = event.target as HTMLInputElement;
            setLookupRound(parseInt(target.value));
          }}
        ></input>
      </form>
      {loading && (
        <div className="flex flex-row justify-center">Loading...</div>
      )}
      {acquiredData && (
        <RoundTickets round={lookupRound} tickets={acquiredData} />
      )}
    </div>
  );
};

const RecentRounds = () => {
  const [rounds, setRecentRounds] = useState<Round[] | null>(null);

  useEffect(() => {
    if (!rounds) {
      callApi(`/Round/Recent`).then((value) =>
        value.json().then((json) => setRecentRounds(json))
      );
    }
  });

  if (!rounds) {
    return <div className="flex flex-row justify-center">Loading...</div>;
  }

  return (
    <div className="flex flex-row justify-center gap-2">
      {rounds.map((round) => (
        <div key={round.id}>
          <LinkColor>
            <Link to={`/ticket/${round.id}`}>{round.id}</Link>
          </LinkColor>
        </div>
      ))}
    </div>
  );
};

const RoundTickets = (props: { round?: number; tickets: Ticket[] }) => {
  const { tickets } = props;

  const [ticket, setTicket] = useState<number | undefined>();

  const { ticketNum } = useLoaderData() as TicketLoader;

  useEffect(() => {
    if (ticketNum && !ticket) {
      setTicket(parseInt(ticketNum));
    }
    if (!ticketNum && ticket) {
      setTicket(undefined);
    }
  }, [ticket, ticketNum, setTicket]);

  const nav = useNavigate();

  const distinctNums: number[] = [];
  const distinctTickets: Ticket[] = [];
  tickets.forEach((ticket) => {
    if (distinctNums.includes(ticket.ticketId)) return;
    distinctNums.push(ticket.ticketId);
    distinctTickets.push(ticket);
  });

  return (
    <div className="border p-2 rounded border-[#3f3f3f] shadow-lg">
      <div className="flex flex-row justify-center text-xl">
        Round {props.round}
      </div>
      <div className="flex flex-col pt-3 gap-2">
        {distinctTickets.map((ticket) => (
          <div key={ticket.id} className="border-t pt-1 border-[#3f3f3f]">
            <LinkColor
              onClick={() => {
                nav(`/ticket/${props.round}/${ticket.ticketId}`);
              }}
            >
              Ticket #{ticket.ticketId}
            </LinkColor>
            : <NameExpand name={ticket.sender} />
            {ticket.recipient && (
              <>
                {" -> "}
                <NameExpand name={ticket.recipient} />
              </>
            )}
            {" -"} {ticket.message}
          </div>
        ))}
      </div>
      {ticket && (
        <Dialog
          open={!!ticket}
          toggle={() => {
            nav("..", { relative: "path" });
          }}
          className="max-h-[80%]"
        >
          <TicketDetail tickets={tickets} ticket={ticket} />
        </Dialog>
      )}
    </div>
  );
};

const TicketDetail = (props: { tickets: Ticket[]; ticket: number }) => {
  const { tickets, ticket } = props;

  const relevantTickets = tickets.filter((tick) => tick.ticketId == ticket);

  return (
    <div className="flex flex-col pt-7 gap-2">
      {relevantTickets.map((ticket) => (
        <div key={ticket.id}>
          <div className="flex flex-row justify-between border-b pt-1 border-[#555555]">
            <div>
              <NameExpand name={ticket.sender} />
              {ticket.recipient && (
                <>
                  {" -> "}
                  <NameExpand name={ticket.recipient} />
                </>
              )}
            </div>
            <div>{new Date(Date.parse(ticket.time)).toLocaleString()}</div>
          </div>
          <div>{ticket.message}</div>
        </div>
      ))}
    </div>
  );
};
