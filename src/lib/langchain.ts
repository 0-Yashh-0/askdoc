import { auth} from "@clerk/nextjs/server";
import pineconeClient from "./pinecone";
import { Index, RecordMetadata } from "@pinecone-database/pinecone";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { PineconeStore } from "@langchain/pinecone";
import { adminDb } from "@/firebaseAdmin";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { EmbeddingsInterface } from "@langchain/core/embeddings";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not defined");
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
const chatModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

async function generateEmbeddings(text: string) {
  try {
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error("Error generating embeddings:", error);
    return [];
  }
}

export const indexName = "askdoc";

async function fetchMessagesFromDB(docId: string) {
  const {userId} = await auth();
  if(!userId) {
    throw new Error("User not found");
  }

  console.log("--- Fetching chat history from the database ---");
  const chats = await adminDb
    .collection('users')
    .doc(userId)
    .collection('files')
    .doc(docId)
    .collection('chat')
    .orderBy('createdAt', 'desc')
    .limit(5) // limit the chat history to upto 5 previous messages
    .get();

  const chatHistory = chats.docs.map((doc) => 
    doc.data().role === 'human'
      ? new HumanMessage(doc.data().message)
      : new AIMessage(doc.data().message)
  );

  console.log(`--- fetched last ${chatHistory.length} messages ---`);
  console.log(chatHistory.map((msg) => msg.content.toString()));

  return chatHistory;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateDocs(docId: string) {
  // authenticate use
  const { userId, getToken } = await auth();
  if (!userId) {
    throw new Error("User not found");
  }
  // fetch download URL from Firebase of file
  console.log("--- Fetching the downloaded URL from Firebase ---");
  const firebaseRef = await adminDb
    .collection("users")
    .doc(userId)
    .collection("files")
    .doc(docId)
    .get();
  const downloadUrl = firebaseRef.data()?.downloadUrl;

  if (!downloadUrl) {
    throw new Error("Download URL not found");
  }

  const token = await getToken({ template: 'supabase' })

  console.log(`--- Download URL fetched successfully: ${downloadUrl} ---`);
  const response = await fetch(`https://${process.env.SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/authenticated/pdfs/${downloadUrl}`, {
    headers: {
      "Authorization": `Bearer ${token}`,
    }
  });
  // Load the PDF into PDFDocument object
  const blobData = await response.blob();
  const blob = new Blob([blobData], { type: 'application/pdf' });

  // Load the PDF document from the specified path
  console.log("--- Loading the PDF file ---");
  try {
    const loader = new PDFLoader(blob);
    const docs = await loader.load();    
    
    // Split the loaded document into smaller parts for easier processing
    console.log("--- Splitting the document into smaller parts ---");
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 2000,
      chunkOverlap: 500,
    });    
    const splitdocs = await splitter.splitDocuments(docs);

    console.log(`--- Split into ${splitdocs.length} parts ---`);
    
    return splitdocs;
  } catch (error) {
    console.error("Error loading PDF:", error);
    throw new Error("Failed to load PDF due to invalid structure.");
  }
}

async function namespaceExists(
  index: Index<RecordMetadata>,
  namespace: string
) {
  console.log(`Checking for namespace: ${namespace}`);
  try {
    const stats = await index.describeIndexStats();
    console.log("Existing namespaces:", Object.keys(stats.namespaces ?? {}));

    return Object.keys(stats.namespaces ?? {}).includes(namespace);
  } catch (error) {
    console.error("Error checking namespace existence:", error);
    return false;
  }
}

// class To use the asRetriever() function from LangChain, you need to create a PineconeStore object that wraps your Pinecone index and provides an embeddings interface.
class CustomPineconeEmbeddings implements EmbeddingsInterface {
  private index: Index<RecordMetadata>;
  private namespace: string;

  constructor(index: Index<RecordMetadata>, namespace: string) {
    this.index = index;
    this.namespace = namespace;
  }

  async embedDocuments(documents: string[]): Promise<number[][]> {
    const embeddings = [];
    for (const document of documents) {
      const embedding = await generateEmbeddings(document);
      if (embedding) {
        embeddings.push(embedding);
      } else {
        console.error("Failed to generate embedding for:", document);
      }
    }
    return embeddings;
  }

  async embedQuery(query: string): Promise<number[]> {
    return await generateEmbeddings(query);
  }
}


export async function generateEmbeddingsInPineconeVectorStore(docId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not found");
  }

  console.log("--- Checking for existing embeddings... ---");
  
  const index = await pineconeClient.index(indexName);
  const namespaceAlreadyExists = await namespaceExists(index, docId);

  if (namespaceAlreadyExists) {
    console.log(
      `--- Namespace ${docId} already exists, reusing existing embeddings. ---`
    );
    
    try {
      return PineconeStore.fromExistingIndex(new CustomPineconeEmbeddings(index, docId), {
        pineconeIndex: index,
        namespace: docId,
        textKey: "text",
      });
    } catch (error) {
      console.error("Error fetching existing embeddings:", error);
    }
  } else {
    console.log("--- Generating embeddings... ---");
    const splitDocs = await generateDocs(docId);
    const chunks = splitDocs; 
    for (const batch of chunks) {
      const text = batch.pageContent; // batch is a Document object
      const embedding = await generateEmbeddings(text);

      if (!embedding) {
        console.error("Failed to generate embedding for:", text);
        continue;
      }

      console.log(
        `--- Storing the embeddings in namespace ${docId} in the ${indexName} Pinecone vector store. ---`
      );
      // Store the embeddings in the Pinecone vector store
      try {
        await index.namespace(docId).upsert([
          {
            id: `${docId}-${batch.id}`, // Use a unique ID for each page
            values: embedding,
            metadata: {
              text: text,
            },
          },
        ]);
      } catch (error) {
        console.error("Error storing embedding:", error);
      }
      
      await sleep(2000); // Prevent hitting Pinecone rate limits
    }
    const customEmbeddings = new CustomPineconeEmbeddings(index, docId);
    const vectorStore = new PineconeStore(customEmbeddings, {
      pineconeIndex: index,
      namespace: docId,
      textKey: 'text',
    });
    return vectorStore;
  }
}

const generateLangchainCompletion = async (docId: string, question:string) => {
  const pineconeVectorStore = await generateEmbeddingsInPineconeVectorStore(docId);
  
  if(!pineconeVectorStore) {
    throw new Error("Pinecone vector store not found");
  }

  // Fetch chat history from db
  const chatHistory = await fetchMessagesFromDB(docId);

  console.log("--- Creating a retriever ---");
  const retriever = pineconeVectorStore.asRetriever({
    searchType: "similarity",
    k : 30,
  });

  // Rephrase query based on chat history
  console.log("--- Rephrasing query based on chat history ---");
  const rephrasedQuery = await rephraseQueryWithHistory(question, chatHistory);
  
  // Retrieve relevant documents using the rephrased query
  console.log("--- Retrieving documents with rephrased query ---");
  let relevantDocuments = await retriever.invoke(rephrasedQuery);
  
  // console.log(`--- Retrieved ${relevantDocuments.length} relevant documents ---`);

  // // If no relevant documents found, fetch the entire document
  if (relevantDocuments.length === 0) {
    console.log("--- No relevant documents found, using entire document ---");
    // Get the full document content
    relevantDocuments = await generateDocs(docId);
  }
  
  // Generate completion based on the query and retrieved documents
  const completion = await generateGeminiCompletion(rephrasedQuery, relevantDocuments, chatHistory);
  
  return completion;
}

// Function to rephrase query using chat history
async function rephraseQueryWithHistory(question: string, chatHistory: (HumanMessage | AIMessage)[]) {
  // Convert chat history to a string format
  const historyString = chatHistory
    .map((msg) => `${msg instanceof HumanMessage ? "Human" : "AI"}: ${msg.content}`)
    .join("\n");
  
  // Create a prompt for Gemini to rephrase the query
  const prompt = `
    Given the following conversation history:
    ${historyString}
    
    And the latest user question:
    "${question}"
    
    Reformulate the question to be standalone and include all necessary context from the conversation history.
    Only output the reformulated question, nothing else.
  `;
  
  try {
    // Use Gemini to rephrase the query
    const geminiChat = chatModel.startChat();
    const result = await geminiChat.sendMessage(prompt);
    const rephrasedQuery = result.response.text().trim();
    
    console.log("Original query:", question);
    console.log("Rephrased query:", rephrasedQuery);
    
    return rephrasedQuery;
  } catch (error) {
    console.error("Error rephrasing query:", error);
    return question; // Fallback to original question if rephrasing fails
  }
}

// Function to generate completion using Gemini
async function generateGeminiCompletion(question: string, documents: any[], chatHistory: (HumanMessage | AIMessage)[]) {
  // Extract text from documents
  const documentTexts = documents.map((doc) => doc.pageContent).join("\n\n");
  
  // Convert chat history to a string format for context
  const historyString = chatHistory
    .map((msg) => `${msg instanceof HumanMessage ? "Human" : "AI"}: ${msg.content}`)
    .join("\n");
  
  // Create a prompt for Gemini
  const prompt = `
    You are an AI assistant answering questions about documents.
    
    Conversation history:
    ${historyString}
    
    Context information from the documents:
    ${documentTexts}
    
    Based on the above context and conversation history, answer the following question:
    ${question}"
  `;
  
  try {
    // Use Gemini to generate a response
    const geminiChat = chatModel.startChat();
    const result = await geminiChat.sendMessage(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("Error generating completion:", error);
    return "I'm sorry, I encountered an error while generating a response.";
  }
};

// Export the model and the run function
export { model, generateLangchainCompletion };