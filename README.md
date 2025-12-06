# Smart Study Hub

Smart Study Hub is an AI-powered study assistant designed to help users organize their learning materials and interact with them using advanced RAG (Retrieval-Augmented Generation) technology. Upload your PDFs, notes, or lecture slides and ask questions to get instant, context-aware answers.

## 🚀 Features

- **Document Management**: Upload and organize PDF documents, notes, and study materials.
- **AI-Powered Q&A**: Ask questions about your documents and receive accurate answers powered by OpenAI and RAG.
- **Interactive Dashboard**: A modern, responsive UI built with Next.js and Tailwind CSS.
- **Vector Search**: Efficient document retrieval using ChromaDB and Sentence Transformers.
- **Secure & Scalable**: Built with FastAPI for high performance and easy scalability.

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 16 (React 19)
- **Styling**: Tailwind CSS, Radix UI, Lucide React
- **State Management**: Zustand
- **Language**: TypeScript

### Backend
- **Framework**: FastAPI (Python)
- **AI/ML**: LangChain, OpenAI API, SentenceTransformers
- **Vector Database**: ChromaDB
- **PDF Processing**: PyPDF2
- **Server**: Uvicorn

## 📂 Project Structure

```
smart-study-hub-frontend/
├── frontend/          # Next.js Frontend Application
│   ├── app/           # App Router Pages & Layouts
│   ├── components/    # Reusable UI Components
│   └── lib/           # Utilities & API Clients
│
├── backend/           # FastAPI Backend Application
│   ├── app/           # Main Application Logic
│   ├── vector_db/     # ChromaDB Storage
│   └── main.py        # Application Entry Point
│
└── README.md          # Project Documentation
```

## ⚡ Getting Started

### Prerequisites
- **Node.js**: v18 or later
- **Python**: v3.9 or later
- **OpenAI API Key**: Required for AI features

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   # Windows
   .\venv\Scripts\activate
   # macOS/Linux
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   Create a `.env` file in the `backend` folder and add your OpenAI API key:
   ```env
   OPENAI_API_KEY=sk-your-openai-api-key-here
   ```

5. Run the server:
   ```bash
   uvicorn app.main:app --reload
   ```
   The API will be available at `http://127.0.0.1:8000`.

### 2. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env.local` file in the `frontend` directory:
   ```env
   NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   The application will be running at `http://localhost:3000`.

## 🔌 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Health check - verify backend status. |
| `POST` | `/upload_pdf` | Upload a PDF file for indexing. |
| `POST` | `/ask` | Ask a question based on uploaded documents. |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
