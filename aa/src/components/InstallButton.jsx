import { useEffect, useState } from "react";

export default function InstallButton() {
  const [prompt, setPrompt] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const installApp = async () => {
    if (!prompt) return;

    prompt.prompt();
    await prompt.userChoice;
    setPrompt(null);
  };

  if (!prompt) return null;

  return (
    <button
      onClick={installApp}
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        padding: "12px 18px",
        background: "#000",
        color: "#fff",
        borderRadius: "10px",
        zIndex: 9999
      }}
    >
      📲 Install App
    </button>
  );
}
