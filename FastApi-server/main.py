
from fastapi import FastAPI

import uvicorn

app = FastAPI()

@app.get("/")
def read_root():
    """
    This function handles GET requests to the root URL and returns a JSON response.
    """
    return {"message": "Hello from FastAPI! The server is working correctly."}
if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
# The server will be accessible at http://127.0.0.1:8000