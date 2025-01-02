"use client";

import { useUser } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase"; // Update the path to your Firebase Firestore instance
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

export enum StatusText {
  UPLOADING = "Uploading file...",
  UPLOADED = "File uploaded successfully",
  SAVING = "Saving file to database...",
  GENERATING = "Generating AI Embeddings, This may take a while...",
}

export type Status = StatusText[keyof StatusText];

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function useUpload() {
  const [progress, setProgress] = useState<number | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);
  const { user } = useUser();
  const handleUpload = async (file: File) => {
    if (!file || !user) return;

    const fileIdToUploadTo = uuidv4();
    const filePath = `users/${user.id}/${fileIdToUploadTo}/${file.name}`;
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

      // Get the public URL of the uploaded file
      const { data: urlData } = supabase.storage
        .from("pdfs")
        .getPublicUrl(filePath);

      if (!urlData) {
        console.error("Failed to get public URL");
        return;
      }

      const fileUrl = urlData.publicUrl;

      // Save file metadata and URL to Firestore
      setStatus(StatusText.SAVING);
      await setDoc(doc(db, "users", user.id, "files", fileIdToUploadTo), {
        name: file.name,
        size: file.size,
        type: file.type,
        url: fileUrl,
        // path: filePath,
        createdAt: new Date(),
      });

      setStatus(StatusText.GENERATING);

      setFileId(fileIdToUploadTo);
    } catch (err) {
      console.log("Error during upload process:", err);
    }
  };

  return { progress, status, fileId, handleUpload };
}

export default useUpload;
