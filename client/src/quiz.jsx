import React from "react";
import { useState } from "react";
import ReactDOM from "react-dom/client";
import {
  useQuery,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

const queryClient = new QueryClient();

function Quiz() {
  const currentUrl = localStorage.getItem("currentUrl");

  const fetchQuiz = async (url) => {
    try {
      const response = await fetch(
        `https://jrang188-server--8000.prod1.defang.dev/quiz?url=${encodeURIComponent(
          url
        )}&amount=3`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      return response.json();
    } catch (error) {
      throw new Error(`Fetch quiz failed: ${error.message}`);
    }
  };

  const useQuiz = (url) => {
    return useQuery({
      queryKey: ["quiz", url],
      queryFn: () => fetchQuiz(url),
      enabled: !!url,
    });
  };

  const { data, error, isLoading } = useQuiz(currentUrl);

  // Use an array to store selected options per question
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [showAnswers, setShowAnswers] = useState(false);

  const handleOptionChange = (questionIndex, optionKey) => {
    // Update the selected option for the corresponding question
    const updatedOptions = [...selectedOptions];
    updatedOptions[questionIndex] = optionKey;
    setSelectedOptions(updatedOptions);
  };

  const handleSubmit = () => {
    setShowAnswers(true);
  };

  return (
    <div className="quiz-container">
      {isLoading && <p>Loading summary...</p>}
      {error && <p>This website is unreachable.</p>}
      {data &&
        data.quiz.map((q, index) => (
          <div key={index} className="question-container">
            <h2>{q.question}</h2>
            <div className="options-container">
              {q.options.map((option) => (
                <div key={option.key} className="option">
                  <label>
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={option.key}
                      checked={selectedOptions[index] === option.key}
                      onChange={() => handleOptionChange(index, option.key)}
                    />
                    {option.option}
                  </label>
                </div>
              ))}
            </div>
            {showAnswers && (
              <div className="answer">
                {selectedOptions[index] === q.answer
                  ? "Correct! 😊"
                  : `Incorrect. The correct answer is: ${
                      q.options.find((opt) => opt.key === q.answer).option
                    } 😔`}
              </div>
            )}
          </div>
        ))}
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}

const index = document.createElement("div");
index.id = "quiz";
document.body.appendChild(index);

ReactDOM.createRoot(index).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Quiz />
    </QueryClientProvider>
  </React.StrictMode>
);
