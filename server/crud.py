from bson.objectid import ObjectId
from db import quiz_collection
from model import Quiz

# Helper function to convert MongoDB data into a dict
def quiz_helper(quiz) -> dict:
    return {
        "id": str(quiz["_id"]),
        "quiz": quiz["quiz"]
    }

# Add new quiz
async def add_quiz(quiz_data: Quiz) -> dict:
    quiz = await quiz_collection.insert_one(quiz_data.dict())
    new_quiz = await quiz_collection.find_one({"_id": quiz.inserted_id})
    return quiz_helper(new_quiz)

# Retrieve all quizzes
async def retrieve_quizzes():
    quizzes = []
    async for quiz in quiz_collection.find():
        quizzes.append(quiz_helper(quiz))
    return quizzes

# Retrieve a quiz by ID
async def retrieve_quiz(id: str) -> dict:
    quiz = await quiz_collection.find_one({"_id": ObjectId(id)})
    if quiz:
        return quiz_helper(quiz)
    return None

# Delete a quiz
async def delete_quiz(id: str):
    quiz = await quiz_collection.find_one({"_id": ObjectId(id)})
    if quiz:
        await quiz_collection.delete_one({"_id": ObjectId(id)})
        return True
    return False
