import { auth } from "@clerk/nextjs/server";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import pineconeClient from "./pinecone";
import { Index, RecordMetadata } from "@pinecone-database/pinecone";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { createStuffDocumentsChain } from "../../node_modules/langchain/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createRetrievalChain } from "../../node_modules/langchain/chains/retrieval";
import { createHistoryAwareRetriever } from "../../node_modules/langchain/chains/history_aware_retriever";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { PineconeStore } from "@langchain/pinecone";
import { PineconeConflictError } from "@pinecone-database/pinecone/dist/errors";
import { adminDb } from "@/firebaseAdmin";

const model = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  modelName: "gpt-4o-mini",
  cache: true,
});

export const indexName = "askdoc";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateDocs(docId: string) {
  // authenticate use
  const { userId } = await auth();
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
  console.log(`--- Download URL fetched successfully: ${downloadUrl} ---`);
  const response = await fetch(downloadUrl);
  // Load the PDF into PDFDocument object
  const data = await response.blob();
  // Load the PDF document from the specified path
  console.log("--- Loading the PDF file ---");
  const loader = new PDFLoader(data);
  const docs = await loader.load();

  // Split the loaded document into smaller parts for easier processing
  console.log("--- Splitting the document into smaller parts ---");
  const splitter = new RecursiveCharacterTextSplitter();

  const splitdocs = await splitter.splitDocuments(docs);
  console.log(`--- Split into ${splitdocs.length} parts ---`);

  return splitdocs;
}

async function namespaceExists(
  index: Index<RecordMetadata>,
  namespace: string
) {
  if (namespace === null) throw new Error("No namespace value provided.");
  const { namespaces } = await index.describeIndexStats();
  return namespaces?.[namespace] != undefined;
}

export async function generateEmbeddingsInPineconeVectorStore(docId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not found");
  }

  let pineconeVectorStore;
  console.log("--- Generating embeddings... ---");
  const embeddings = new OpenAIEmbeddings();

  const index = await pineconeClient.index(indexName);
  const namespaceAlreadyExists = await namespaceExists(index, docId);

  if (namespaceAlreadyExists) {
    console.log(
      `--- Namespace ${docId} already exists, reusing existing embeddings. ---`
    );

    pineconeVectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex: index,
      namespace: docId,
    });

    return pineconeVectorStore;
  } else {
    const splitDocs = await generateDocs(docId);
    console.log(
      `--- Storing the embeddings in namespace ${docId} in the ${indexName} Pinecone vector store. ---`
    );

    const chunks = splitDocs.slice(0, 10); // Example batch size
    for (const batch of chunks) {
      await PineconeStore.fromDocuments([batch], embeddings, {
        pineconeIndex: index,
        namespace: docId,
      });
      await sleep(2000); // Prevent hitting Pinecone rate limits
    }
    return pineconeVectorStore;
  }
}
