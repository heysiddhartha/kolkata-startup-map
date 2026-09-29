import React, { useState } from "react";
import { createRoot } from "react-dom/client";

function App() {
  const [subredditName, setSubredditName] = useState("");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [status, setStatus] = useState("");

  async function post() {
    setStatus("Posting...");
    const response = await fetch("/internal/reddit/post", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ subredditName, title, text }),
    });
    const result = await response.json();
    setStatus(result.ok ? "Posted successfully." : result.error || "Post failed.");
  }

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: 24, fontFamily: "system-ui" }}>
      <h1>Kolkata Startup Map — Reddit Assistant</h1>
      <p>Review the exact content below before posting it from your Reddit account.</p>

      <label>Subreddit</label>
      <input value={subredditName} onChange={(e) => setSubredditName(e.target.value)} placeholder="kolkata" style={{ display: "block", width: "100%", margin: "8px 0 16px", padding: 10 }} />

      <label>Title</label>
      <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ display: "block", width: "100%", margin: "8px 0 16px", padding: 10 }} />

      <label>Post</label>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={12} style={{ display: "block", width: "100%", margin: "8px 0 16px", padding: 10 }} />

      <button onClick={post} disabled={!subredditName || !title || !text}>
        Post as my Reddit account
      </button>

      <p>{status}</p>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
