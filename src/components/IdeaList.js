"use client";
import { useState, useEffect } from "react";
import { getFirestore, collection, query, orderBy, onSnapshot } from "firebase/firestore";

const db = getFirestore();

export default function IdeaList() {
  const [ideas, setIdeas] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "ideas"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setIdeas(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold">Startup Idea</h2>
      {ideas.length === 0 ? (
        <p>Post your ideas!</p>
      ) : (
        ideas.map((idea) => (
          <div key={idea.id} className="border p-4 rounded shadow">
            <h3 className="text-xl font-semibold">{idea.title}</h3>
            <p>{idea.description}</p>
            <p className="text-sm text-gray-500">Author: {idea.userId}</p>
          </div>
        ))
      )}
    </div>
  );
}
