"use client"

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

// import { GlobeIcon } from "lucide-react";

// const features = [
//   {
//     name: 'Store your PDF Documents',
//     description: 'Keep all your important PDF files securely and easily accessible anytime, anywhere',
//     icon: GlobeIcon 
//   },
//   {
//     name: 'Store your PDF Documents',
//     description: 'Keep all your important PDF files securely and easily accessible anytime, anywhere',
//     icon: GlobeIcon 
//   },
//   {
//     name: 'Store your PDF Documents',
//     description: 'Keep all your important PDF files securely and easily accessible anytime, anywhere',
//     icon: GlobeIcon 
//   },
//   {
//     name: 'Store your PDF Documents',
//     description: 'Keep all your important PDF files securely and easily accessible anytime, anywhere',
//     icon: GlobeIcon 
//   },
//   {
//     name: 'Store your PDF Documents',
//     description: 'Keep all your important PDF files securely and easily accessible anytime, anywhere',
//     icon: GlobeIcon 
//   },
//   {
//     name: 'Store your PDF Documents',
//     description: 'Keep all your important PDF files securely and easily accessible anytime, anywhere',
//     icon: GlobeIcon 
//   },
// ];

export default function Home() {
  return (
  <div className="flex-1 overflow-y-auto py-2 lg:py-5 bg-gradient-to-bl from-white to-indigo-600">
    <div className="bg-white py-24 sm:py-32 rounded-md drop-shadow-xl">
      <div className="flex flex-col justify-center items-center mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl sm:text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">
            Your Interactive Document Companion
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Transform Your PDFs into Interactive Conversations
          </p>
          <p className="mt-6 text-lg text-gray-600 leading-8">
            Introducing{" "}
            <span className="font-bold text-indigo-600">ASKDOC</span>
            <br />
            <br />Upload your document and our chatbot will answer questions, summarise content and answer all your Qs. Ideal for everyone from students to professionals,
            <span className="font-bold text-indigo-600">ASKDOC</span>{" "} turns static documents into {" "}
            <span className="font-bold">dynamic conversation</span>, enhancing productivity and understanding.
          </p>
        </div>
        <Button asChild className="mt-8">
          <Link href={"/dashboard"}> GET STARTED </Link>
        </Button>
        <div>

        </div>
        <div>
          <Image 
            alt="App Screenshot"
            src="/appSS.jpg"
            width={2432}
            height={1442}
            className="mb-[-0%] rounded-xl shadow-2xl ring-1 ring-gray-900/10"
        /> </div>
      </div>
    </div>
  </div>

);}
