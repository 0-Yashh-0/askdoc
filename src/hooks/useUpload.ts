"use client";

import { useUser, useSession } from "@clerk/nextjs";
// import { createClient } from "@supabase/supabase-js";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase"; // Update the path to your Firebase Firestore instance
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { generateEmbeddings } from "@/actions/generateEmbeddings";
import {createClerkSupabaseClient} from "@/supabase"

export enum StatusText {
  UPLOADING = "Uploading file...",
  UPLOADED = "File uploaded successfully",
  SAVING = "Saving file to database...",
  GENERATING = "Generating AI Embeddings, This may take a while...",
}

export type Status = StatusText[keyof StatusText];

function useUpload() {
  const { session } = useSession();
  const [progress, setProgress] = useState<number | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);
  const [embeddingProgress, setEmbeddingProgress] = useState<number>(0);
  const { user } = useUser();

  const handleUpload = async (file: File) => {
    if (!file || !user) return;

    const fileIdToUploadTo = uuidv4();
    const filePath = `users/${user.id}/${fileIdToUploadTo}/${file.name}`;

    const clerkToken = await session?.getToken({
      // Pass the name of the JWT template you created in the Clerk Dashboard
      template: 'supabase',
    });
  
    const supabase = createClerkSupabaseClient(clerkToken);
    try {
      setStatus(StatusText.UPLOADING);

      // Upload file to Supabase bucket
      const { error } = await supabase.storage
        .from("pdfs") // Replace with your Supabase bucket name
        .upload(filePath, file);

      if (error) {
        console.log("Error uploading file to Supabase:", error.message);
        throw error;
      }

      setProgress(100);
      setStatus(StatusText.UPLOADED);

      // Save file metadata and URL to Firestore
      setStatus(StatusText.SAVING);
      await setDoc(doc(db, "users", user.id, "files", fileIdToUploadTo), {
        name: file.name,
        size: file.size,
        type: file.type,
        downloadUrl: filePath,
        createdAt: new Date(),
      });

      setStatus(StatusText.GENERATING);
      setEmbeddingProgress(0);
      const timer = setInterval(() => {
        // Increment progress gradually until it nearly reaches 100%
        setEmbeddingProgress((prev) => (prev < 95 ? prev + 5 : prev));
      }, 1000);

      await generateEmbeddings(fileIdToUploadTo);

      clearInterval(timer);
      setEmbeddingProgress(100);
      setFileId(fileIdToUploadTo);
    } catch (err) {
      console.log("Error during upload process:", err);
    }
  };

  return { progress, status, fileId, handleUpload, embeddingProgress };
}

export default useUpload;
