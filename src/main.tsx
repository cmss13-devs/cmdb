import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { LookupMenu } from "./components/userLookup";
import { Stickybans } from "./components/stickybans";
import { Tickets } from "./components/tickets";
import HomePage from "./components/homePage";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { WhitelistMenu } from "./components/whitelistPanel";
import { NewPlayers } from "./components/newPlayers";
import { AuthentikPanel } from "./components/authentikPanel";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "",
        element: <HomePage />,
      },
      {
        path: "/ticket/:round?/:ticketNum?",
        element: <Tickets />,
        loader: ({ params }) => {
          return {
            round: params.round || "",
            ticketNum: params.ticketNum || "",
          };
        },
      },
      {
        path: "/sticky",
        element: <Stickybans />,
      },
      {
        path: "/user/:ckey?",
        element: <LookupMenu />,
        loader: ({ params }) => {
          return params.ckey || "";
        },
      },
      {
        path: "/whitelists",
        element: <WhitelistMenu />,
      },
      {
        path: "/new_players",
        element: <NewPlayers />,
      },
      {
        path: "/authentik",
        element: <AuthentikPanel />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
