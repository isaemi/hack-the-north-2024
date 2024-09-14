import { useState, useCallback } from "react";

interface StreamResponse {
  streamResponse: (
    prompt: string,
    onToken: (token: string) => void,
  ) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const useCohereChatStream = (apiUrl: string): StreamResponse => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const streamResponse = useCallback(
    async (prompt: string, onToken: (token: string) => void): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: prompt }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("Failed to get response reader");
        }

        const decoder = new TextDecoder();

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6).trim();
              if (data === "[DONE]") {
                setIsLoading(false);
                return;
              }
              onToken(data);
            }
          }
        }

        setIsLoading(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred",
        );
        setIsLoading(false);
      }
    },
    [apiUrl],
  );

  return { streamResponse, isLoading, error };
};

export default useCohereChatStream;
