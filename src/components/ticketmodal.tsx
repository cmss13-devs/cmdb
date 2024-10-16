import React, { useEffect, useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { Ticket, TicketLoader } from "../types/ticket";
import { LinkColor } from "./link";
import { NameExpand } from "./nameExpand";
import { Dialog } from "./dialog";

type TicketModalType = {
  round?: number;
  tickets: Ticket[];
};

export const TicketModal: React.FC<TicketModalType> = (
  props: TicketModalType
) => {
  const { tickets, round } = props;

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
  let distinctTickets: Ticket[] = [];
  tickets.forEach((ticket) => {
    if (distinctNums.includes(ticket.ticketId)) return;
    distinctNums.push(ticket.ticketId);
    distinctTickets.push(ticket);
  });

  if (!round) {
    distinctTickets = distinctTickets.reverse();
  }

  return (
    <div className="border p-2 rounded border-[#3f3f3f] shadow-lg">
      {round && (
        <div className="flex flex-row justify-center text-xl">
          Round {round}
        </div>
      )}
      <div className="flex flex-col pt-3 gap-2">
        {distinctTickets.map((ticket) => (
          <div key={ticket.id} className="border-t pt-1 border-[#3f3f3f]">
            <LinkColor
              onClick={() => {
                nav(`/ticket/${ticket.roundId}/${ticket.ticketId}`);
              }}
            >
              {!round && `#${ticket.roundId} `}Ticket #{ticket.ticketId}
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
