import cohere
from dotenv import load_dotenv
import os

# Load environment variables from the .env file (if present)
load_dotenv()

# Initialize the Cohere client with your API key
co = cohere.Client(os.getenv("COHERE_API_KEY"))

def summarize_webpage(url, language='English'):
    """Fetches and summarizes the content of a webpage in the preferred language."""
    
    response = co.chat(
        message=f"The preferred language is {language}. This is the content: {url}",
        model="command-r-plus",
        preamble="Write key points of this content as bullet points in the preferred language. Keep it concise and short.",
    )

    return response.text

# Example usage:
url = "https://ggbaker.ca/data-science/content/etl.html"  # Replace with any URL
preferred_language = "English"  # User's preferred language

# Summarize the content of the webpage
summary = summarize_webpage(url, preferred_language)
print(summary)
