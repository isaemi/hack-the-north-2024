import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import cohere
import json
from crud import add_quiz, retrieve_quiz, retrieve_quizzes
from model import Quiz

# Load environment variables from the .env file (if present)
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

# Initialize the Cohere client with your API key
co = cohere.Client(os.getenv("COHERE_API_KEY"))


@app.get("/")
async def get_default():
    return "Studylingo API", 200


@app.get("/summarize")
async def summarize_endpoint(url: str, language="en"):
    if not url:
        raise HTTPException(status_code=400, detail="URL cannot be empty")

    response = co.chat(
        message=f"The preferred language is {language}. This is the content: {url}",
        model="command-r-plus",
        preamble="Write key points of this content as bullet points in the preferred language. Keep it concise and short. Return in JSON format",
        response_format={
            "type": "json_object",
            "schema": {
                "type": "object",
                "required": ["summary"],
                "properties": {
                    "summary": {
                        "type": "array",
                        "items": {"type": "string"},
                    },
                },
            },
        },
    )

    return json.loads(response.text)


@app.post("/quiz")
async def quiz_endpoint(url: str, language="en", amount=1):
    if not url:
        raise HTTPException(status_code=400, detail="URL cannot be empty")

    response = co.chat(
        model="command-r-plus",
        message=f"Return a {amount} of quizzes from the content: {url}. The preferred language is {language}. Return in JSON format",
        response_format={
            "type": "json_object",
            "schema": {
                "type": "object",
                "required": ["quiz"],
                "properties": {
                    "quiz": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "required": ["question", "options", "answer"],
                            "properties": {
                                "question": {"type": "string"},
                                "options": {
                                    "type": "array",
                                    "items": {
                                        "type": "object",
                                        "required": ["option", "key"],
                                        "properties": {
                                            "option": {"type": "string"},
                                            "key": {"type": "integer"},
                                        },
                                    },
                                },
                                "answer": {"type": "integer"},
                            },
                        },
                    }
                },
            },
        },
    )

    # Parse the response
    quiz_data = json.loads(response.text)
    
    if "quiz" not in quiz_data:
        raise HTTPException(status_code=500, detail="Invalid response format")

    # Store the quiz in MongoDB
    quiz = await add_quiz(Quiz(quiz=quiz_data["quiz"]))
    
    return {"quiz_id": quiz["id"], "quiz": quiz["quiz"]}

# Get all quizzes
@app.get("/quizzes/")
async def get_quizzes():
    quizzes = await retrieve_quizzes()
    return quizzes

# Get a quiz by ID
@app.get("/quiz/{id}")
async def get_quiz(id: str):
    quiz = await retrieve_quiz(id)
    if quiz:
        return quiz
    raise HTTPException(status_code=404, detail=f"Quiz {id} not found")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
