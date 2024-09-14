import cohere
from tinytune.llmcontext import LLMContext, Model, Message
from typing import Any, Generator

class CohereMessage(Message):
    __slots__ = ("Role", "Text")

    def __init__(self, role: str, text: str):
        super().__init__(role, text)
        self.Role = role
        self.Text = text

    def ToDict(self):
        return {"role": self.Role, "text": self.Text}


class CohereContext(LLMContext[CohereMessage]):
    def __init__(self, model: str, api_key: str):
        super().__init__(Model("cohere", model))
        self.APIKey: str = api_key
        self.Client = cohere.Client(api_key=self.APIKey)
        self.Messages: list[CohereMessage] = []
        self.QueuePointer: int = 0
        self.StreamGenerator: Generator[str, None, None] | None = None

    def Prompt(self, message: CohereMessage):
        self.MessageQueue.append(message)
        return self

    def Run(self, *args, **kwargs):
        stream: bool = kwargs.get("stream", False)

        while self.QueuePointer < len(self.MessageQueue):
            current_message = self.MessageQueue[self.QueuePointer]

            if stream:
                self.StreamGenerator = self._stream_response(current_message.Text)
                yield from self.StreamGenerator
            else:
                response = self._get_response(current_message.Text)
                self.Messages.append(current_message)
                self.Messages.append(CohereMessage("CHATBOT", response))

            self.QueuePointer += 1

        return self

    def _get_response(self, message: str) -> str:
        response = self.Client.chat(
            model=self.Model.Name,
            chat_history=[msg.ToDict() for msg in self.Messages],
            message=message,
        )
        return response.text

    def _stream_response(self, message: str) -> Generator[str, None, None]:
        full_response = ""
        for event in self.Client.chat_stream(
            model=self.Model.Name,
            chat_history=[msg.ToDict() for msg in self.Messages],
            message=message,
        ):
            if event.event_type == "text-generation":
                chunk = event.text
                full_response += chunk
                yield chunk
            elif event.event_type == "stream-end":
                yield f"\nStream finished: {event.finish_reason}"

        self.Messages.append(CohereMessage("USER", message))
        self.Messages.append(CohereMessage("CHATBOT", full_response))


# Example usage:
if __name__ == "__main__":
    context = CohereContext("command-r-plus", "<YOUR API KEY>")

    # Non-streaming example
    context.Prompt(CohereMessage("USER", "Hey, my name is Michael!"))
    context.Run()
    context.Prompt(CohereMessage("USER", "Can you tell me about LLMs?"))
    context.Run()

    print("\n--- Streaming example ---\n")

    # Streaming example
    stream_context = CohereContext("command-r-plus", "<YOUR API KEY>")
    stream_context.Prompt(CohereMessage("USER", "What is an LLM?"))
    for token in stream_context.Run(stream=True):
        print(token, end="", flush=True)
