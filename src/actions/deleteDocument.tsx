'use server'

import { adminDb } from '@/firebaseAdmin';
import { indexName } from '@/lib/langchain';
import pineconeClient from '@/lib/pinecone';
import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import { createClient } from "@supabase/supabase-js";

async function deleteDocument(docId: string) {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("User not found");
    }
    
    
    // Delete the document from Supabase
    const docRef = await adminDb
        .collection("users")
        .doc(userId!)
        .collection("files")
        .doc(docId)
        .get();
    const filePath = docRef.data()?.filePath;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { error } = await supabase.storage
        .from("pdfs")
        .remove([filePath]);
    if(error){
        throw new Error("Error deleting document from Supabase", error);
    }

    // Delete metadata from firebase database
    await adminDb
        .collection("users")
        .doc(userId!)
        .collection("files")
        .doc(docId)
        .delete();
    
    // Delete the embedding from Pinecone
    try {
        const index = await pineconeClient.index(indexName);
        const stats = await index.describeIndexStats();
        if (stats.namespaces && Object.keys(stats.namespaces).includes(docId)) {
          await index.namespace(docId).deleteAll();
        } else {
          console.log("No embeddings found for document, skipping Pinecone deletion.");
        }
      } catch (error) {
        console.error("Error checking/deleting embeddings from Pinecone:", error);
        // Optionally, you can choose to ignore this error if embeddings deletion is not critical
      }
    

    // Revalidate the dashboard page to ensure the documents are upto date
    revalidatePath("/dashboard");
}

export default deleteDocument
