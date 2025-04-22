"use client";
import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "../firebase";

export default function IdeaForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // 文件上传
  const [mediaFiles, setMediaFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e) => {
    if (e.target.files?.length > 0) {
      setMediaFiles(Array.from(e.target.files));
    }
  };

  const submitIdea = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) {
      alert("Please login first！");
      return;
    }

    let mediaURLs = [];
    try {
      if (mediaFiles.length > 0) {
        let uploadedCount = 0;
        const totalFiles = mediaFiles.length;
        for (const file of mediaFiles) {
          const fileRef = ref(
            storage,
            `ideas/${auth.currentUser.uid}/${Date.now()}_${file.name}`
          );
          const uploadTask = uploadBytesResumable(fileRef, file);

          const downloadURL = await new Promise((resolve, reject) => {
            uploadTask.on(
              "state_changed",
              (snapshot) => {
                const progress =
                  (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(progress);
              },
              (error) => reject(error),
              () => {
                getDownloadURL(uploadTask.snapshot.ref).then((url) => {
                  resolve(url);
                });
              }
            );
          });
          mediaURLs.push(downloadURL);
          uploadedCount += 1;
        }
      }
    } catch (err) {
      console.error("文件上传失败：", err);
      alert("文件上传失败，请查看控制台错误信息。");
      return;
    }

    try {
      await addDoc(collection(db, "ideas"), {
        title,
        description,
        userId: auth.currentUser.uid,

        mediaURLs,
        likes: [],
        favorites: [],
      });

      setTitle("");
      setDescription("");
      setMediaFiles([]);
      setUploadProgress(0);
      alert("Successfully uploaded your idea！");
    } catch (error) {
      console.error("Failed to upload:", error);
    }
  };

  return (
    <form
      onSubmit={submitIdea}
      className="flex flex-col space-y-4 max-w-md mx-auto p-4 border rounded shadow"
    >
      <h2 className="text-xl font-bold">💡 Submit your idea</h2>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-2 rounded"
        required
      />
      <textarea
        placeholder="Describe your idea..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="border p-2 rounded"
        required
      />

      {/* 文件上传 */}
      <label className="block mb-2">Upload Images/Videos/Attachments:</label>
      <input type="file" onChange={handleFileChange} multiple />
      {uploadProgress > 0 && (
        <p>Upload progress: {uploadProgress.toFixed(0)}%</p>
      )}

      <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
        Submit
      </button>
    </form>
  );
}
