import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

/**
 * Application Entry Point
 * Renders the root App component with React 19
 */
ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleReCaptchaProvider
    reCaptchaKey={
      import.meta.env.VITE_RECAPTCHA_SITE_KEY ||
      "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
    }
  >
    <App />
  </GoogleReCaptchaProvider>,
);
