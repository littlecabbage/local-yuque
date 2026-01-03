from sqlmodel import SQLModel, create_engine, Session
import os

# Ensure data directory exists
DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data"))
if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

sqlite_file_name = "local_yuque.db"
sqlite_url = f"sqlite:///{os.path.join(DATA_DIR, sqlite_file_name)}"

connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, connect_args=connect_args)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
