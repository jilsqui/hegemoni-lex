import json
import urllib.request

API_KEY = "sk-993f457348cf2031dae5d0edca8b1282b645ba53b7342b7000f3d619468b5cc6"
BASE_URL = "https://openagentic.id/api/v1"

def test_chat():
    url = f"{BASE_URL}/chat/completions"
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "oa-claude-sonnet-4.6",
        "messages": [
            {"role": "user", "content": "Halo! Bisakah kamu memperkenalkan dirimu secara singkat dalam bahasa Indonesia?"}
        ]
    }
    
    req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers=headers)
    
    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            reply = result["choices"][0]["message"]["content"]
            print("Response from OpenAgentic:")
            print(reply)
    except Exception as e:
        print("Error connecting to OpenAgentic API:", e)

if __name__ == "__main__":
    test_chat()
