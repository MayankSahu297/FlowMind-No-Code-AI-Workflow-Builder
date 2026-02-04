import os
import google.generativeai as genai
from dotenv import load_dotenv

# Path to the .env file in the backend directory
env_path = os.path.join(os.getcwd(), '.env')
load_dotenv(dotenv_path=env_path)

key = os.getenv("GEMINI_API_KEY")
print(f"DEBUG: Using API Key: {key[:10]}...{key[-5:]}" if key else "DEBUG: No API Key found!")

if key:
    try:
        genai.configure(api_key=key)
        print("DEBUG: Listing all generative models...")
        models = genai.list_models()
        count = 0
        for m in models:
            if 'generateContent' in m.supported_generation_methods:
                print(f"- {m.name} (Display Name: {m.display_name})")
                count += 1
        if count == 0:
            print("DEBUG: No models found with 'generateContent' support.")
    except Exception as e:
        print(f"DEBUG: Error occurred: {str(e)}")
else:
    print("DEBUG: Skipping configuration due to missing key.")
