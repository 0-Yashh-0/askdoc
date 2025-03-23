'use client'

import { FormEvent, useEffect, useRef, useState, useTransition } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Loader2Icon } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { db } from "../../firebase";
import { useCollection } from "react-firebase-hooks/firestore";
import { collection, orderBy, query } from "firebase/firestore"; 
import { askQuestion } from "@/actions/askQuestion";
import ChatMessage from "./ChatMessage";

export type Message = {
    id?: string;
    role: "human" | "ai" | "placeholder";
    message: string;
    createdAt: Date;
}

function Chat({id}: {id: string}) {
    const { user } = useUser();

    const [input, setInput] = useState<string>("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isPending, startTransition] = useTransition();
    const bottomOfChatRef = useRef<HTMLDivElement>(null);

    const [snapshot, loading] = useCollection(
        user && 
        query(
            collection(db, "users", user?.id, "files", id, "chat"),
            orderBy("createdAt", "asc")
        )
    );

    useEffect(() => {
        bottomOfChatRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [messages]);

    useEffect(() => {
        if(!snapshot) return;

        console.log("updated Snapshot", snapshot.docs);

        // get second last message to check if the AI is thinking
        const lastMessage = messages.pop();
        if(lastMessage?.role === 'ai' && lastMessage?.message === "Thinking..."){
            // return as this is a dummy placeholder msg
            return;
        }

        const newMessages = snapshot.docs.map(doc => {
            const { role, message, createdAt } = doc.data();
            return {
                id: doc.id,
                role,
                message,
                createdAt: createdAt.toDate(),
            };
        });
        setMessages(newMessages);

    }, [snapshot]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const q = input;
        setInput("");

        setMessages((prev) => [
            ...prev,
            {
                role: "human",
                message: q,
                createdAt: new Date(),
            },
            {
                role: "ai",
                message: "Thinking...",
                createdAt: new Date(),
            },
        ]);

        startTransition(async () => {
            const {success, message} = await askQuestion(id, q);

            if(!success){
                // toast

                setMessages((prev) =>
                prev.slice(0, prev.length - 1).concat([
                    {
                        role:"ai",
                        message: `Whoops... ${message}`,
                        createdAt: new Date(),
                    }
                ]));
            }
        })
    }
  
    return (
    <div className="flex flex-col h-full overflow-y-scroll">
        <div className="flex-1 w-full">
        {/* Chat messages */}
        {loading ? (
            <div className="flex items-center justify-center">
                <Loader2Icon className="animate-spin h-20 w-20 text-indigo-600 mt-20" />
            </div>
        ) : (
        <div className="p-5">
            {messages.length === 0 && (
                <ChatMessage
                    key={"placeholder"}
                    message={{
                        role: "ai",
                        message:"Ask me anything about the document!",
                        createdAt: new Date(),
                    }}
                />
            )}
            {messages.map((message, index) =>(
                <ChatMessage key={index} message={message} />
            ))}

            <div ref={bottomOfChatRef} />
        </div>
        )}
        </div>
        <form onSubmit={handleSubmit}
            className="flex sticky space-x-2 bottom-0 p-5 bg-indigo-600/75"
        >
            <Input 
                placeholder="Ask a question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="bg-white/80"
            />

            <Button type="submit" disabled={!input || isPending}>
                {isPending ? (
                    <Loader2Icon className="animate-spin text-indigo-600" />
                ) : (
                    "Ask"
                )}
            </Button>
        </form>
    </div>
  )
}

export default Chat
