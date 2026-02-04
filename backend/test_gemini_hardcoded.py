import os
import google.generativeai as genai

key = "AIzaSyAvocivzl7asgAfgjgK0rojHYWYUFh-vnM"
genai.configure(api_key=key)

print("Listing available models:")
try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"- {m.name}")
except Exception as e:
    print(f"Error: {e}")
