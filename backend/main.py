from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import auth_routes, test_routes

app = FastAPI()

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(test_routes.router, prefix="/test")
app.include_router(auth_routes.router, prefix="/auth")