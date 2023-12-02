# main.py
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.sql import text
from routers import user_router
from database import SessionLocal, get_db
import logging
from fastapi.middleware.cors import CORSMiddleware

logging.basicConfig(level=logging.DEBUG)

app = FastAPI()

origins = ["http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Verify that the database is connected by testing get_db()
# Try `curl localhost:8000` to see the result
@app.get("/")
def root(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"message": "Database is connected"}
    except Exception as e:
        logging.error(e)
        raise HTTPException(status_code=500, detail="Database is not connected")

app.include_router(user_router.router, prefix="/api", tags=["users"], dependencies=[Depends(get_db)])
