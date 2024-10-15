import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { LookupMenu } from "./components/userLookup";
import { Stickybans } from "./components/stickybans";
import { Tickets } from "./components/tickets";
import HomePage from "./components/homePage";
import { createHashRouter, RouterProvider } from "react-router-dom";

const router = createHashRouter([
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
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
