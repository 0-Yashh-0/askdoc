'use server'

import { Message } from "@/components/Chat";
import { adminDb } from "@/firebaseAdmin";
import { generateLangchainCompletion } from "@/lib/langchain";
import { auth } from "@clerk/nextjs/server";
// import { generateLangchainCompletion } from "../lib/langchain";

// const FREE_LIMIT = 5;
// const  PRO_LIMIT = 100;

export async function askQuestion(id : string, question: string) {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("User not found");
    }

    const chatRef = adminDb
        .collection("users")
        .doc(userId)
        .collection("files")
        .doc(id)
        .collection("chat")

    // checking how many user msgs are there in chat
    const chatSnapshot = await chatRef.get();
    const userMessages = chatSnapshot.docs.filter(
        (doc) => doc.data().role === "human"
    );
    
    //  limit the PRO/FREE users

    const userMessage: Message = {
        role: "human",
        message: question,
        createdAt: new Date(),
    }

    await chatRef.add(userMessage);

    // Generate AI response
    const reply = await generateLangchainCompletion(id, question);
    if (typeof reply === 'string') {
        const aiMessage: Message = {
          role: "ai",
          message: reply,
          createdAt: new Date(),
        };
        await chatRef.add(aiMessage);
        return { success: true, message: reply };
    } else {
        console.error("Unexpected response from generateLangchainCompletion:", reply);
        return { success: false, message: "An error occurred while generating the response." };
    }

    // await chatRef.add(aiMessage);

    // return { success: true, message: reply };
}