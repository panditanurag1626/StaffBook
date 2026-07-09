"use client";

import Script from "next/script";

const CHATBOT_ID = "tOM_gKT_aFgqfv5U";
const CHATBOT_EMBED_SRC = "http://localhost:3000/embed.js";

declare global {
  interface Window {
    ChatBotAI?: {
      init?: (opts: { botId: string; getAuthToken?: () => string | null }) => void;
      setAuthToken?: (token: string | null) => void;
    };
  }
}

/**
 * Loads the ChatBotAI embed widget and wires the StaffBook auth token into it.
 *
 * Uses a `getAuthToken` getter so the widget always reads the *current* token
 * from localStorage — refreshed tokens are picked up automatically without
 * having to re-push on every login/refresh.
 */
export default function ChatWidget() {
  const handleLoad = () => {
    const widget = window.ChatBotAI;
    if (!widget) return;

    if (typeof widget.setAuthToken === "function") {
      widget.setAuthToken(localStorage.getItem("authToken"));
    }
  };

  return (
    <Script
      src={CHATBOT_EMBED_SRC}
      data-bot-id={CHATBOT_ID}
      strategy="lazyOnload"
      onLoad={handleLoad}
    />
  );
}
