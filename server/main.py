import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Generator
from CohereContext import CohereContext, CohereMessage  # Import CohereMessage as well
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Load API key from environment variable
API_KEY = os.getenv("COHERE_API_KEY")
if not API_KEY:
    raise EnvironmentError("COHERE_KEY environment variable not set")

# Initialize CohereContext
cohere_context = CohereContext("command-r-plus", API_KEY)

class Prompt(BaseModel):
    text: str
    role: str = "USER"  # Default role is USER, but can be overridden

def token_generator(prompt: Prompt) -> Generator[str, None, None]:
    cohere_context.Prompt(CohereMessage(prompt.role, prompt.text))
    for token in cohere_context.Run(stream=True):
        if token:
            print(token, end="", flush=True)

        yield f"data: {token}\n\n"
    yield "data: [DONE]\n\n"


@app.post("/prompt")
async def prompt_endpoint(prompt: Prompt):
    if not prompt.text:
        raise HTTPException(status_code=400, detail="Prompt text cannot be empty")

    return StreamingResponse(token_generator(prompt), media_type="text/event-stream")

@app.post("/summarize")
async def summarize_endpoint(url: str, language="English"):
    if not url:
        raise HTTPException(status_code=400, detail="URL cannot be empty")
    
    prompt = f"Write a short summary of this content as bullet points in the preferred language. The preferred language is {language}. This is the content: {url}. Do not return anything else aside bullet points."
    
    return StreamingResponse(token_generator(Prompt(text=prompt)), media_type="text/event-stream")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
