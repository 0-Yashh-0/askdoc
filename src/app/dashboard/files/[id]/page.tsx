import { auth } from "@clerk/nextjs/server";
import { adminDb } from "@/firebaseAdmin";
import PDFView from "@/components/PDFView";


async function ChatToFilePage({
    params: { id },
}: {
    params:{
        id: string;
    }
}) {
    auth.protect();
    const { userId } = await auth();

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
  
    return (
    <div className="grid lg:grid-cols-5 h-full overflow-hidden">
      {/* Right Side */}
      <div className="col-span-5 lg:grid-cols-2 overflow-y-auto">
        {/* Chat */}
      </div>

      {/* Left Side */}
      <div className="col-span-5 lg:grid-cols-3 bg-gray-100 border-r-2 lg:border-indigo-600 lg:-order-1 overflow-auto">
        {/* PDF View */}
        <PDFView url={url} />
      </div>
    </div>
  )
}

export default ChatToFilePage
