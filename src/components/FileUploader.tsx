"use client";
import { JSX, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { CheckCircleIcon, CircleArrowDown, HammerIcon, RocketIcon, SaveIcon } from "lucide-react";
import useUpload, { StatusText } from "@/hooks/useUpload";
import { useRouter } from "next/navigation";


function FileUploader() {
  const { progress, status, fileId, handleUpload, embeddingProgress } = useUpload();
  const router = useRouter();

  useEffect(() => {
    if (fileId) {
      router.push(`/dashboard/files/${fileId}`);
    }
  }, [fileId, router]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]; // Only one file is allowed
    if (file) {
      await handleUpload(file);
    }
  }, [handleUpload]);

  const statusIcons: {
    [key in StatusText]: JSX.Element;
  } = {
    [StatusText.UPLOADING]:(
      <RocketIcon className="h-20 w-20 text-indigo-600" />
    ),
    [StatusText.UPLOADED]: (
      <CheckCircleIcon className="h-20 w-20 text-indigo-600" />
    ),
    [StatusText.SAVING]: (
      <SaveIcon className="h-20 w-20 text-indigo-600" />
    ),
    [StatusText.GENERATING]: (
      <HammerIcon className="h-20 w-20 text-indigo-600 animate-bounce" />
    )
  }

  const { getRootProps, getInputProps, isDragActive, isFocused } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      "application/pdf": [".pdf"],
    },
  });

  const uploadInProgress = progress != null && progress >= 0 && progress <= 100;
  const statusText = status as StatusText;

  return (
    <div className="flex flex-col gap-4 items-center max-w-7xl mx-auto">
      {uploadInProgress && (
        <div className="mt-32 flex flex-col justify-center items-center gap-5">
          <div
            className={`radial-progress bg-indigo-300 text-white border-indigo-600 border-4 ${
              progress === 100 && "hidden"
            }`}
            role="progressbar"
            style={{
              "--value": progress,
              "--size": "12rem",
              "--thickness": "1.3rem",
            } as React.CSSProperties}
          >
            {progress} %
          </div>
          {status === StatusText.GENERATING ? (
            <div className="flex flex-col items-center gap-4">
              {/* Show the hammer icon */}
              {statusIcons[StatusText.GENERATING]}
              {/* Show the progress bar for embeddings */}
              <div className="w-full max-w-md ">
                <div className="h-4 bg-gray-200 rounded-full">
                  <div
                    className="h-4 bg-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${embeddingProgress}%` }}
                  />
                </div>
                <p className="mt-2 text-indigo-600">{status}</p>
              </div>
            </div>
          ) : (
            statusIcons[statusText]
          )}
          {status !== StatusText.GENERATING && <p className="text-indigo-600 animate-pulse">{status}</p>}
        </div>
      )}
      {!uploadInProgress && 
      (<div
        {...getRootProps()}
        className={`p-10 border-2 border-dashed mt-10 w-[90%] border-indigo-600 text-indigo-600 rounded-lg h-96 flex items-center justify-center ${
          isFocused || isDragActive ? "bg-indigo-300" : "bg-indigo-100"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center">
          {isDragActive ? (
            <>
              <RocketIcon className="h-20 w-20 animate-ping" />
              <p>Drop the file here ...</p>
            </>
          ) : (
            <>
              <CircleArrowDown className="h-20 w-20 animate-bounce" />
              <p>
                Drag &apos;n&apos; drop a file here, or click to select a file
              </p>
              <p className="text-xs">
                (NOT MORE THAN 5MB)
              </p>
            </>
          )}
        </div>
      </div>)}
    </div>
  );
}

export default FileUploader;
