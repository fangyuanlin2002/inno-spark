"use client";
import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function CommentList({ ideaId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    const commentsRef = collection(db, "ideas", ideaId, "comments");
    const q = query(commentsRef, orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [ideaId]);

  // 发布评论
  const submitComment = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) {
      alert("请先登录再评论");
      return;
    }
    const commentsRef = collection(db, "ideas", ideaId, "comments");
    try {
      await addDoc(commentsRef, {
        userId: auth.currentUser.uid,
        text: newComment,
        createdAt: serverTimestamp(),
      });
      setNewComment("");
    } catch (err) {
      console.error("评论失败：", err);
      alert("评论失败，请查看控制台错误信息。");
    }
  };

  return (
    <div className="bg-gray-100 p-2 rounded mt-2">
      <h4 className="font-semibold mb-2">评论</h4>

      {comments.length === 0 ? (
        <p>还没有评论</p>
      ) : (
        comments.map((comment) => (
          <div key={comment.id} className="border-b border-gray-300 py-1">
            <p>{comment.text}</p>
            <p className="text-xs text-gray-500">User: {comment.userId}</p>
          </div>
        ))
      )}

      <form onSubmit={submitComment} className="mt-2 flex space-x-2">
        <input
          type="text"
          placeholder="写下你的评论..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="border p-1 flex-grow"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          发表
        </button>
      </form>
    </div>
  );
}
