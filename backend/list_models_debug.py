import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
with open('models_list.txt', 'w', encoding='utf-8') as f:
    try:
        models = [m.name for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]
        f.write('\n'.join(models))
    except Exception as e:
        f.write(str(e))
