import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

export default function Summary() {
  const [url, setUrl] = useState();

  useEffect(() => {
    // Function to get the active tab URL
    const getActiveTabUrl = () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
          setUrl(tabs[0].url);
        } else {
          setUrl("No active tab found");
        }
      });
    };

    // Call the function to get the active tab URL
    getActiveTabUrl();
  }, []);

  const fetchSummary = async (url) => {
    // Store current url in localStorage
    localStorage.setItem("currentUrl", url);
    const response = await fetch(
      `https://jrang188-server--8000.prod1.defang.dev/summarize?url=${url}`
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  };

  const useSummary = (url) => {
    return useQuery({
      queryKey: ["summary", url],
      queryFn: () => fetchSummary(url),
      enabled: !!url, // Only fetch if the URL is defined
    });
  };

  const { data, error, isLoading } = useSummary(url);

  return (
    <div className="container">
      <h2 className="subtitle">Summary</h2>
      {isLoading && <iframe src="https://giphy.com/embed/3oEjI6SIIHBdRxXI40" width="480" height="480" style="" frameBorder="0" class="giphy-embed" allowFullScreen></iframe>}
      {error && <p>This website is unreachable.</p>}
      {data && (
        <ul className="text-left">
          {data.summary.map((line, index) => (
            <li key={index}>{line}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
