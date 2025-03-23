'use client'

import { useRouter } from "next/navigation";
import byteSize from "byte-size";
import { Button } from "./ui/button";
import { DownloadCloud, Trash2Icon } from "lucide-react";
import deleteDocument from "@/actions/deleteDocument";
import { useState } from "react";

function Document({
    id, name, size, downloadUrl,
} : {
    id: string,
    name: string,
    size: number,
    downloadUrl: string,
}) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
  return (
    <div className="flex flex-col w-64 h-80 rounded-xl bg-white drop-shadow-md justify-between p-4 transition-all transform hover:scale-105 hover:bg-indigo-600 hover:text-white cursor-pointer group">
      <div
      className="flex-1" 
      onClick={() => {
        router.push(`/dashboard/files/${id}`);
      }}>
        <p className="font-semibold line-clamp-2">{name}</p>
        <p className="text-sm text-gray-500 group-hover:text-indigo-100">
            {byteSize(size).value} {byteSize(size).unit}
        </p>
      </div>

      <div className="flex space-x-2 justify-end">
        <Button variant="outline" disabled={isDeleting} onClick={async () => {
            const prompt = window.confirm("Are you sure you want to delete this document?");
            if(prompt){
              setIsDeleting(true);
              try {
                await deleteDocument(id);
                router.refresh();
              } catch (error) {
                console.error("Error deleting document:", error);
              } finally {
                setIsDeleting(false);
              }
            }
          }}
        >
          <Trash2Icon className="h-6 w-6 text-red-500" />
        </Button>

        <Button variant="outline" asChild>
          <a href={downloadUrl} download>
            <DownloadCloud className="h-6 w-6 text-indigo-600" />
          </a>
        </Button>

      </div>
    </div>
  )
}

export default Document
