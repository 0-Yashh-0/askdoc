# 📄 Ask Your Doc

This is a powerful **Next.js** web application designed for **storing, managing, and interacting with PDF documents**. The app utilizes **AI-powered embeddings** for chat functionalities. Keeps it very **simple** to make **summarization, notes and insights** out of the document.

---

## 🚀 Features

- 📂 **Secure PDF Storage** - Upload and manage PDF documents efficiently.
- 🧠 **AI-Powered Search & Chat** - Convert PDFs into vector embeddings and chat with them using **Google's Gemini**.
- 🗄 **Metadata Management** - Store and retrieve document metadata seamlessly using **Firebase**.
- 🔗 **Easy Sharing** - Share documents with secure permission controls.
- 🌐 **Cloud Integration** - Uses **Supabase** for file storage and **Pinecone** as a vector database for embeddings.
- 🛠 **LangChain Integration** - Generates embeddings and facilitates conversational AI using LangChain.

---

## 🛠 Tech Stack

- **Framework**: Next.js
- **Authentication**: Clerk.js
- **Database**: Firebase Firestore
- **Storage**: Supabase Storage
- **AI Search & Chat**:
  - Gemini **"text-embedding-004"** for vector embeddings
  - Gemini **"gemini-2.0-flash"** for chat functionality
- **Vector Database**: Pinecone
- **Embeddings Processing**: LangChain
- **UI**: Tailwind CSS, Lucide Icons
- **Server Actions**: Next.js Server Components

---

## 🚀 Getting Started

### **1️⃣ Clone the Repository**

```bash
# Using GitHub Codespaces (Recommended for cloud development)
gh repo clone askdoc

# OR for local development
git clone askdoc
```

### **2️⃣ Install Dependencies**

```bash
npm install
# or
yarn install
```

### **3️⃣ Set Up Environment Variables**

Create a `.env.local` file and add the following environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_KEY=your-supabase-service-key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
CLERK_SECRET_KEY=your-clerk-secret-key
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_PINECONE_ENV=your-pinecone-environment
NEXT_PUBLIC_PINECONE_API_KEY=your-pinecone-api-key
NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-api-key
```

### **4️⃣ Run the Development Server**

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API.
- [Clerk.js Authentication](https://clerk.com) - Secure authentication service.
- [Supabase](https://supabase.com/docs) - Database & file storage.
- [Firebase Firestore](https://firebase.google.com/docs/firestore) - NoSQL cloud database.
- [Pinecone](https://www.pinecone.io/) - AI-driven vector search.
- [LangChain](https://python.langchain.com/) - AI-powered embeddings and chat.
- [Gemini API](https://ai.google.dev/) - Google's AI API for embeddings and chat.

