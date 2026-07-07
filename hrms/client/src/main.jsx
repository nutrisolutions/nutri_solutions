import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { EmployeeAuthProvider } from "./context/EmployeeAuthContext";
import { ChatProvider } from "./context/ChatContext";
import "lenis/dist/lenis.css";
import "./styles/global.css";
import "./styles/redesign.css";
import "./styles/responsive.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <EmployeeAuthProvider>
          <ChatProvider>
            <App />
          </ChatProvider>
        </EmployeeAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
