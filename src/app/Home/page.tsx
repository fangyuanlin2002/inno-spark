"use client";

import { useState, useEffect } from "react";
import { auth } from "../../firebase";
import Auth from "../../components/Auth";
import PostForm from "../../components/PostForm";
import PostCard, { Post } from "../../components/PostCard";
import Link from "next/link";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  getDocs,
} from "firebase/firestore";
import type { User as FirebaseUser } from "firebase/auth";

const db = getFirestore();

export default function Home() {
  // 👇 这里把类型改成 firebase.User | null
  const [user, setUser] = useState<FirebaseUser | null>(null);

  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // 订阅登录状态
  useEffect(() => {
    // onAuthStateChanged 返回一个 unsubscribe 函数
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
    });
    // 在卸载时取消监听
    return () => unsubscribe();
  }, []);

  // 拉取所有帖子，按 likesCount 降序
  useEffect(() => {
    (async () => {
      setLoadingPosts(true);
      const postsCol = collection(db, "posts");
      const q = query(postsCol, orderBy("likesCount", "desc"));
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({
        ...(d.data() as Omit<Post, "postId">),
        postId: d.id,
      }));
      setPosts(list);
      setLoadingPosts(false);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-indigo-50 py-10 px-6">
      <h1 className="text-3xl text-black font-bold text-center mb-6">
        🚀 InnoSpark
      </h1>


      {/* 登录后显示发帖表单 & 个人主页按钮 */}
      {user ? (
        <div className="max-w-lg mx-auto mb-8">
          <div className="flex justify-between items-center mb-4">
            <Link href="/UserProfile" passHref>
              <button className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 transition">
                My Profile
              </button>
            </Link>
            {/* 👇 现在 user 是 FirebaseUser */}
            <span className="text-sm text-gray-600">
              Logged in：{user.displayName || user.email}
            </span>
          </div>
          <PostForm />
        </div>
      ) : (
        <p className="text-center text-gray-700 mb-8">
          请先登录以发布和点赞帖子。
        </p>
      )}

      {/* 帖子列表 */}
      <div className="max-w-lg mx-auto space-y-6">
        <h2 className="text-2xl text-black font-semibold">Posts</h2>
        {loadingPosts ? (
          <p className="text-center text-gray-600">加载中…</p>
        ) : posts.length > 0 ? (
          posts.map((post) => <PostCard key={post.postId} post={post} />)
        ) : (
          <p className="text-center text-gray-600">暂无帖子。</p>
        )}
      </div>
    </div>
  );
}
