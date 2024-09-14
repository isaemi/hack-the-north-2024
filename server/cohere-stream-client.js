class CohereStreamClient {
  constructor(apiUrl) {
    this.apiUrl = apiUrl;
  }

  async streamResponse(prompt, onToken, onComplete, onError) {
    try {
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: prompt }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
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
              onComplete();
              return;
            }
            onToken(data);
          }
        }
      }

      onComplete();
    } catch (error) {
      onError(error);
    }
  }
}

// Usage example
const apiUrl = "http://localhost:8000/prompt";
const client = new CohereStreamClient(apiUrl);

function streamResponse() {
  const promptInput = document.getElementById("prompt-input");
  const outputElement = document.getElementById("output");
  const submitButton = document.getElementById("submit-button");

  const prompt = promptInput.value;
  outputElement.textContent = ""; // Clear previous output
  submitButton.disabled = true; // Disable button during streaming

  client.streamResponse(
    prompt,
    (token) => {
      outputElement.textContent += token; // Append each token to the output
    },
    () => {
      console.log("Stream completed");
      submitButton.disabled = false; // Re-enable button
    },
    (error) => {
      console.error("Error:", error);
      outputElement.textContent = "An error occurred. Please try again.";
      submitButton.disabled = false; // Re-enable button
    },
  );
}

// Attach the streamResponse function to the button click event
document
  .getElementById("submit-button")
  .addEventListener("click", streamResponse);