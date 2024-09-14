from typing import Union
from fastapi import FastAPI
from tinytune.tool import tool
from CohereContext import CohereContext, CohereMessage
from dotenv import load_dotenv

import sys
import os

load_dotenv()

# Example usage:
if __name__ == "__main__":
    # Streaming example
    stream_context = CohereContext("command-r-plus", str(os.getenv("COHERE_KEY")))
    stream_context.Prompt(CohereMessage("USER", "What is an LLM?"))
    stream_context.Run(stream=True)


app = FastAPI()


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}