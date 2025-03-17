import { auth } from "@clerk/nextjs/server";
import { adminDb } from "@/firebaseAdmin";
import PDFView from "@/components/PDFView";
import { createClerkSupabaseClient } from "@/supabase";
import Chat from "@/components/Chat";

async function ChatToFilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // Await the params object to access its properties

  auth.protect();
  const { userId, getToken } = await auth();

  if (!userId) {
    throw new Error("User ID is null");
  }

  const ref = await adminDb
    .collection("users")
    .doc(userId)
    .collection("files")
    .doc(id)
    .get();

  const url = ref.data()?.downloadUrl;

  const token = await getToken({ template: 'supabase' })

  const supabase = createClerkSupabaseClient(token);

  const { data: urlData } = await supabase.storage
        .from("pdfs")
        .createSignedUrl(url, 3600);

      if (!urlData) {
        console.error("Failed to get public URL");
        return;
      }

      const fileUrl = urlData.signedUrl;


  if (!url) {
    throw new Error("Download URL not found");
  }

  return (
    <div className="grid lg:grid-cols-5 h-full overflow-hidden">
      {/* Right Side */}
      <div className="col-span-5 lg:col-span-2 overflow-y-auto">
        {/* Chat */}
        <Chat id={id} />
      </div>

      {/* Left Side */}
      <div className="col-span-5 lg:col-span-3 bg-gray-100 border-r-2 lg:border-indigo-600 lg:-order-1 overflow-auto">
        {/* PDF View */}
        <PDFView url={fileUrl} />
      </div>
    </div>
  );
}

export default ChatToFilePage;
