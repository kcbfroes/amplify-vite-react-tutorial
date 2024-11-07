import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";
import { ThemeProvider } from '@aws-amplify/ui-react';
import { AppDataProvider } from "./context/AppDataContext.tsx";

Amplify.configure(outputs);

ReactDOM.createRoot(document.getElementById("root")!).render(

    <ThemeProvider>
      <AppDataProvider>
        <App />
      </AppDataProvider>
    </ThemeProvider>

);
