from pydantic import BaseModel
from typing import List, Dict

class Option(BaseModel):
    option: str
    key: int

class Question(BaseModel):
    question: str
    options: List[Option]
    answer: int

class Quiz(BaseModel):
    quiz: List[Question]
