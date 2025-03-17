import { auth } from "@clerk/nextjs/server";
import PlaceholderDocument from "./PlaceholderDocument"
import { adminDb } from "@/firebaseAdmin";
import Document from "./Document";

async function Documents() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not found");
  }

  const documentSnapshot = await adminDb
    .collection("users")
    .doc(userId)
    .collection("files")
    .get();

  return (
    <div className="flex flex-wrap p-5 bg-gray-100 justify-center lg:jusitfy-start rounded-sm gap-5 max-w-7xl mx-auto">
      {documentSnapshot.docs.map((doc) => {
        const { name, downloadUrl, size } = doc.data();

        return(
          <Document 
            key={doc.id}
            id={doc.id}
            name={name}
            size={size}
            downloadUrl={downloadUrl}
          />
        )
      })}

      <PlaceholderDocument />

    </div>
  )
}

export default Documents
