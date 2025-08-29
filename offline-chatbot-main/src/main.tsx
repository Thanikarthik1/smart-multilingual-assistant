import * as React from "react";
import * as ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { BrowserRouter as Router } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import './styles/tailwind.css';
import "./styles/index.scss";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <Router>
    <React.StrictMode>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={true}>
        <App />
      </ThemeProvider>
    </React.StrictMode>
  </Router>
);
