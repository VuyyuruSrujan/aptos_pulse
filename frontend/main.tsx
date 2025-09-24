import "../vite.polyfills";
import "./index.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import App from "@/App.tsx";
// Internal components
import { Toaster } from "@/components/ui/toaster.tsx";


const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster />
        <ToastContainer />
      </QueryClientProvider>
  </React.StrictMode>,
);
