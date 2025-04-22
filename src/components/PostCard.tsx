"use client";

import React, { useState, useEffect } from "react";
import { auth } from "../firebase";
import { getFirestore, doc, updateDoc, arrayUnion, arrayRemove, increment } from "firebase/firestore";

export interface Post {
  postId: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  media?: string[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  visibility: "public" | "private" | "connectionsOnly";
  tags?: string[];
  coverImage?: string;
  creationTime: { toDate: () => Date };
  likedBy: string[];
  savedBy: string[];
  status: "draft" | "published" | "archived";
  postType: "project" | "investment" | "article";
}

export default function PostCard({ post }: { post: Post }) {
  const db = getFirestore();
  const user = auth.currentUser;
  const uid = user?.uid;

  // local state to reflect whether current user has liked/saved
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount);

  // initialize
  useEffect(() => {
    if (uid) {
      setLiked(post.likedBy.includes(uid));
      setSaved(post.savedBy.includes(uid));
    }
  }, [post.likedBy, post.savedBy, uid]);

  const toggleLike = async () => {
    if (!uid) return alert("Please log in to like");
    const postRef = doc(db, "posts", post.postId);
    if (liked) {
      // unlike
      await updateDoc(postRef, {
        likedBy: arrayRemove(uid),
        likesCount: increment(-1),
      });
      setLikesCount((c) => c - 1);
    } else {
      // like
      await updateDoc(postRef, {
        likedBy: arrayUnion(uid),
        likesCount: increment(1),
      });
      setLikesCount((c) => c + 1);
    }
    setLiked(!liked);
  };

  const toggleSave = async () => {
    if (!uid) return alert("Please log in to save");
    const postRef = doc(db, "posts", post.postId);
    if (saved) {
      // unsave
      await updateDoc(postRef, {
        savedBy: arrayRemove(uid),
      });
    } else {
      // save
      await updateDoc(postRef, {
        savedBy: arrayUnion(uid),
      });
    }
    setSaved(!saved);
  };

  const date = post.creationTime.toDate().toLocaleString();

  return (
    <div className="border rounded-lg shadow p-4 bg-white text-black">
      {post.coverImage && (
        <img
          src={post.coverImage}
          alt="Cover"
          className="w-full h-48 object-cover rounded-md mb-4"
        />
      )}

      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl font-semibold text-black">{post.title}</h3>
        <span className="text-sm text-black">{date}</span>
      </div>
      <p className="text-sm text-black mb-4">By {post.authorName}</p>

      {post.tags && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs text-black bg-gray-200 px-2 py-1 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <p className="mb-4 whitespace-pre-wrap text-black">{post.content}</p>

      {post.media && post.media.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          {post.media.map((url, i) => {
            const ext = url.split("?")[0].toLowerCase();
            if (ext.match(/\.(mp4|webm|ogg|mov)$/)) {
              return (
                <video
                  key={i}
                  controls
                  className="w-full h-32 object-cover rounded"
                >
                  <source src={url} />
                </video>
              );
            } else {
              return (
                <img
                  key={i}
                  src={url}
                  alt={`media-${i}`}
                  className="w-full h-32 object-cover rounded"
                />
              );
            }
          })}
        </div>
      )}

      {/* Interaction buttons */}
      <div className="flex items-center gap-6 text-sm text-black">
        <button
          onClick={toggleLike}
          className={`flex items-center space-x-1 text-black ${
            liked ? "text-blue-600" : ""
          }`}
        >
          <span>👍</span>
          <span>{likesCount}</span>
        </button>

        <button
          onClick={toggleSave}
          className={`flex items-center space-x-1 text-black ${
            saved ? "text-green-600" : ""
          }`}
        >
          <span>💾</span>
          <span>{saved ? "Saved" : "Save"}</span>
        </button>

        <span className="text-black">💬 {post.commentsCount}</span>
        <span className="text-black">🔗 {post.sharesCount}</span>
      </div>
    </div>
  );
}
