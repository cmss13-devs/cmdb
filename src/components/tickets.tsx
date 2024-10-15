import React, { useContext, useEffect, useState } from "react";
import { callApi } from "../helpers/api";
import { Round } from "../types/rounds";
import { Link } from "./link";
import { Ticket } from "../types/ticket";
import { Dialog } from "./dialog";
import { NameExpand } from "./nameExpand";
import { GlobalContext } from "../types/global";

export const Tickets: React.FC = () => {
  const [lookupRound, setLookupRound] = useState<number | undefined>();

  const [acquiredData, setAcquiredData] = useState<Ticket[] | undefined>();

  const global = useContext(GlobalContext);

  const updateLookup = (id?: number) => {
    const round = id || lookupRound;
    setLookupRound(round);
    if (!round) return;

    callApi(`/Ticket/${round}`).then((value) =>
      value.status == 404
        ? global?.updateAndShowToast(
            "No tickets found for the provided round ID."
          )
        : value.json().then((json) => {
            setAcquiredData(json);
          })
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <RecentRounds updateRound={updateLookup} />
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
      {acquiredData && (
        <RoundTickets round={lookupRound} tickets={acquiredData} />
      )}
    </div>
  );
};

const RecentRounds = (props: { updateRound: (_id: number) => void }) => {
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
          <Link onClick={() => props.updateRound(round.id)}>{round.id}</Link>
        </div>
      ))}
    </div>
  );
};

const RoundTickets = (props: { round?: number; tickets: Ticket[] }) => {
  const { tickets } = props;

  const [ticket, setTicket] = useState<number | undefined>();

  const distinctNums: number[] = [];
  const distinctTickets: Ticket[] = [];
  tickets.forEach((ticket) => {
    if (distinctNums.includes(ticket.ticketId)) return;
    distinctNums.push(ticket.ticketId);
    distinctTickets.push(ticket);
  });

  return (
    <>
      <div className="flex flex-row justify-center text-xl">
        Round {props.round}
      </div>
      <div className="flex flex-col pt-3">
        {distinctTickets.map((ticket) => (
          <div key={ticket.id}>
            <Link
              onClick={() => {
                setTicket(ticket.ticketId);
              }}
            >
              Ticket #{ticket.ticketId}
            </Link>
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
        <Dialog open={!!ticket} toggle={() => setTicket(undefined)}>
          <TicketDetail tickets={tickets} ticket={ticket} />
        </Dialog>
      )}
    </>
  );
};

const TicketDetail = (props: { tickets: Ticket[]; ticket: number }) => {
  const { tickets, ticket } = props;

  const relevantTickets = tickets.filter((tick) => tick.ticketId == ticket);

  return (
    <div className="flex flex-col pt-7 gap-2">
      {relevantTickets.map((ticket) => (
        <div key={ticket.id}>
          <div className="flex flex-row justify-between">
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
