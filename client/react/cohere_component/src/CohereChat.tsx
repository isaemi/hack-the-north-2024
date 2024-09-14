import React, { useState, useCallback, FormEvent } from "react";
import useCohereChatStream from "./useCohereChatStream";

const CohereChatComponent: React.FC = () => {
  const [prompt, setPrompt] = useState<string>("");
  const [response, setResponse] = useState<string>("");
  const apiUrl = "http://localhost:8000/prompt";
  const { streamResponse, isLoading, error } = useCohereChatStream(apiUrl);

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setResponse("");
      let accumulatedResponse = "";

      await streamResponse(prompt, (token: string) => {
        accumulatedResponse += token + " "; // Add a space after each token
        setResponse(accumulatedResponse.trim());
      });

      // Ensure the final state update happens after the stream ends
      setResponse(accumulatedResponse.trim());
    },
    [prompt, streamResponse],
  );

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={prompt}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setPrompt(e.target.value)
          }
          placeholder="Enter your prompt"
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Generating..." : "Submit"}
        </button>
      </form>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <div style={{ whiteSpace: "pre-wrap" }}>{response}</div>
    </div>
  );
};

export default CohereChatComponent;
