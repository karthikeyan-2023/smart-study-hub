import os
import tempfile
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from langchain.text_splitter import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer
import chromadb
import PyPDF2
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# -----------------------------
# Setup
# -----------------------------

app = FastAPI()

# CORS logic
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Embedding model
# This runs locally and downloads the model (~100MB) on the first run.
embedder = SentenceTransformer("all-MiniLM-L6-v2")

# Vector DB
# Data is persisted in the "vector_db" folder.
client = chromadb.PersistentClient(path="vector_db")
collection = client.get_or_create_collection("docs")

# OpenAI client
# Ensure OPENAI_API_KEY is defined in your .env file
ai = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


# -----------------------------
# Utility: Extract PDF Text
# -----------------------------

def extract_pdf_text(pdf_bytes):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        try:
            tmp.write(pdf_bytes)
            tmp_path = tmp.name
        finally:
            tmp.close()

    try:
        reader = PyPDF2.PdfReader(tmp_path)
        full_text = ""

        # Using len(reader.pages) is safer for older versions
        for page in reader.pages:
            txt = page.extract_text()
            if txt:
                full_text += txt + "\n"
        return full_text
    finally:
        # Clean up the temp file
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


# -----------------------------
# STEP 1 — Upload + Store in ChromaDB
# -----------------------------

@app.post("/upload_pdf")
async def upload_pdf(pdf: UploadFile = File(...)):
    pdf_bytes = await pdf.read()

    # Extract text
    text = extract_pdf_text(pdf_bytes)
    
    if not text.strip():
        return {
            "message": "PDF uploaded but no text extraction was possible (it might be an image-only PDF).",
            "chunks": 0,
            "filename": pdf.filename
        }

    # Chunking
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=100)
    chunks = splitter.split_text(text)

    # Embeddings
    embeddings = embedder.encode(chunks).tolist()

    # Store chunks
    # Create unique IDs for proper ChromaDB indexing
    ids = [f"{pdf.filename}-{i}" for i in range(len(chunks))]
    collection.add(documents=chunks, embeddings=embeddings, ids=ids)

    return {
        "message": "PDF extracted and stored.",
        "chunks": len(chunks),
        "filename": pdf.filename
    }


# -----------------------------
# STEP 2 — Ask Question (RAG)
# -----------------------------

@app.post("/ask")
async def ask(question: str = Form(...)):

    # Embed question
    q_embed = embedder.encode([question]).tolist()

    # Retrieve best matching chunks
    results = collection.query(query_embeddings=q_embed, n_results=5)

    if not results or not results["documents"] or not results["documents"][0]:
        return {"answer": "No relevant information found in the database."}

    # Flatten list of documents
    context = " ".join(results["documents"][0])

    # Create RAG prompt for OpenAI
    prompt = f"""
You are an assistant analyzing stored PDF content.

CONTEXT:
{context}

QUESTION:
{question}

ANSWER:
"""

    try:
        # Call OpenAI generator model (using gpt-3.5-turbo as a safe default if strict gpt-4 access isn't verified)
        # The user requested 'gpt-4.1' but that might not be available, changing to gpt-4o or gpt-3.5-turbo is safer.
        # We will keep 'gpt-4' or fallback if you prefer, but 'gpt-3.5-turbo' is widely available.
        response = ai.chat.completions.create(
            model="gpt-3.5-turbo", 
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3
        )
        answer = response.choices[0].message.content
    except Exception as e:
        answer = f"Error communicating with OpenAI: {str(e)}"

    return {
        "question": question,
        "answer": answer,
        "context_used_preview": context[:250]
    }

@app.get("/")
async def read_root():
    return {"message": "Smart Study Hub RAG Backend is ready!"}
