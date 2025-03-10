"use client";
import { useState } from "react";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth } from "../firebase";

const db = getFirestore();

export default function IdeaForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const submitIdea = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) {
      alert("Please login first！");
      return;
    }

    try {
      await addDoc(collection(db, "ideas"), {
        title,
        description,
        userId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      });
      setTitle("");
      setDescription("");
      alert("Successfully uploaded your idea！");
    } catch (error) {
      console.error("Failed to upload:", error);
    }
  };

  return (
    <form onSubmit={submitIdea} className="flex flex-col space-y-4 max-w-md mx-auto p-4 border rounded shadow">
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
      <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
        Submit
      </button>
    </form>
  );
}
