import React, { useEffect, useState } from "react";
import { Player } from "./userLookup";
import { callApi } from "../helpers/api";
import { NameExpand } from "./nameExpand";
import { DetailedCid } from "./detailedCid";
import { DetailedIp } from "./detailedIp";

export const NewPlayers: React.FC = () => {
  const [newPlayers, setNewPlayers] = useState<Player[]>();
  const [searchedTime, setSearchedTime] = useState<number | undefined>();

  const [timeAgo, setTimeAgo] = useState(240);

  useEffect(() => {
    if (newPlayers && searchedTime === timeAgo) return;

    callApi(`/NewPlayers/${timeAgo}`).then((value) => {
      value.json().then((json: Player[]) => {
        setNewPlayers(json);
        setSearchedTime(timeAgo);
      });
    });
  }, [newPlayers, timeAgo, searchedTime]);

  if (!newPlayers) {
    return "Loading...";
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-row gap-3 justify-end">
        <label>Joins since (minutes ago):</label>
        <input
          onKeyDown={(ev) => {
            if (ev.key === "Enter") {
              console.log("doing it");
              setTimeAgo(Number.parseInt(ev.currentTarget.value));
            }
          }}
          defaultValue={240}
          type="number"
        />
      </div>
      <table>
        <thead>
          <tr>
            <th>CKEY</th>
            <th>Time Connected</th>
            <th>BYOND account age</th>
            <th>CID</th>
            <th>IP</th>
          </tr>
        </thead>
        <tbody>
          {newPlayers.map((player) => (
            <tr key={player.ckey}>
              <td>
                <NameExpand name={player.ckey} />
              </td>
              <td>
                {new Date(
                  Date.parse(player.firstJoinDate!.replace(" ", "T"))
                ).toLocaleString()}
              </td>
              <td>
                {new Date(
                  Date.parse(player.byondAccountAge!.replace(" ", "T"))
                ).toLocaleString()}
              </td>
              <td>
                <DetailedCid cid={player.lastKnownCid} />
              </td>
              <td>
                <DetailedIp ip={player.lastKnownIp} />{" "}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
