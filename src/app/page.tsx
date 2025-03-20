"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { AppWindowIcon, AtomIcon, BookOpenTextIcon, BrainCircuitIcon, ChartNetworkIcon, GlobeIcon } from "lucide-react";

const features = [
  {
    name: 'Secure Cloud Storage',
    description: 'Store your PDFs securely in Supabase cloud storage with authenticated access, ensuring your documents are protected and available anytime.',
    icon: GlobeIcon
  },
  {
    name: 'Intuitive Document Management',
    description: 'Upload, view, and organize your PDF documents with a clean, responsive interface built with Next.js and Tailwind CSS.',
    icon: AppWindowIcon
  },
  {
    name: 'AI-Powered Document Chat',
    description: 'Ask questions about your documents and receive intelligent responses using Google Gemini AI, making information retrieval effortless.',
    icon: AtomIcon
  },
  {
    name: 'Smart Document Analysis',
    description: 'Leverage Google\'s Gemini AI to analyze, understand, and extract insights from your PDF content automatically.',
    icon: BrainCircuitIcon
  },
  {
    name: 'Efficient Metadata Storage',
    description: 'Store document metadata in Firebase for quick retrieval and seamless integration with your user profile and authentication system.',
    icon: BookOpenTextIcon
  },
  {
    name: 'Vector-Based Document Search',
    description: 'Find information across your documents instantly with Pinecone vector database, enabling semantic search powered by text embeddings.',
    icon: ChartNetworkIcon
  }
];


export default function Home() {
  return (
    <div className="flex-1 overflow-y-auto p-2 lg:p-5 bg-gradient-to-bl from-white to-indigo-600">
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
              <br />
              Upload your document and our chatbot will answer questions,
              summarise content and answer all your Qs. Ideal for everyone from
              students to professionals,
              <span className="font-bold text-indigo-600">ASKDOC</span> turns
              static documents into{" "}
              <span className="font-bold">dynamic conversation</span>, enhancing
              productivity and understanding.
            </p>
          </div>
          <Button asChild className="mt-8">
            <Link href={"/dashboard"}> GET STARTED </Link>
          </Button>
          <div className="relative pt-16 overflow-hidden">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <Image
                alt="App Screenshot"
                src="/image.png"
                width={2432}
                height={1442}
                className="mb-[-0%] rounded-xl shadow-2xl ring-1 ring-gray-900/10"
              />
              <div aria-hidden="true" className="relative">
                <div className="absolute bottom-0 -inset-x-32 bg-gradient-to-t from-white/95 pt-[5%]"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-16 max-w-7xl px-6 sm:mt-20 md:mt-24 lg:px-8">
          <dl className="mx-auto grid max-w-2xl grid-cols-1 gap-x-6 gap-y-10 text-base leading-7 text-gray-600 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16">
            {features.map((feature, indx) => (
              <div key={indx} className="relative pl-9">
                <dt className="inline font-semibold text-gray-900">
                  <feature.icon aria-hidden="true" className="absolute left-1 top-1 h-5 w-5 text-indigo-600" />
                </dt>
                <dd>
                  {feature.description}
                </dd>
              </div>
              
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
