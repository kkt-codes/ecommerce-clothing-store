import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { SignupSigninModalProvider } from "./hooks/useSignupSigninModal";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <SignupSigninModalProvider>
        <App />
      </SignupSigninModalProvider>
    </BrowserRouter>
  </StrictMode>
);
