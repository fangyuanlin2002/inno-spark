"use client";
import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import CommentList from "./CommentList";

export default function IdeaList() {
  const [ideas, setIdeas] = useState([]);
  const [expandedIdeaId, setExpandedIdeaId] = useState(null); 

  useEffect(() => {
    const q = query(collection(db, "ideas"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setIdeas(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleLike = async (idea) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert("请先登录再点赞！");
      return;
    }
    const userId = currentUser.uid;
    const isLiked = idea.likes?.includes(userId) || false;
    const ideaRef = doc(db, "ideas", idea.id);

    try {
      if (isLiked) {
        await updateDoc(ideaRef, {
          likes: arrayRemove(userId),
        });
      } else {

        await updateDoc(ideaRef, {
          likes: arrayUnion(userId),
        });
      }
    } catch (error) {
      console.error("点赞操作失败：", error);
      alert("点赞操作失败，请查看控制台错误信息。");
    }
  };

  const handleFavorite = async (idea) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert("请先登录再收藏！");
      return;
    }
    const userId = currentUser.uid;
    const isFavorited = idea.favorites?.includes(userId) || false;
    const ideaRef = doc(db, "ideas", idea.id);

    try {
      if (isFavorited) {
        await updateDoc(ideaRef, {
          favorites: arrayRemove(userId),
        });
      } else {
        await updateDoc(ideaRef, {
          favorites: arrayUnion(userId),
        });
      }
    } catch (error) {
      console.error("收藏操作失败：", error);
      alert("收藏操作失败，请查看控制台错误信息。");
    }
  };

  const toggleComments = (ideaId) => {
    if (expandedIdeaId === ideaId) {
      setExpandedIdeaId(null);
    } else {
      setExpandedIdeaId(ideaId);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold">Startup Idea</h2>
      {ideas.length === 0 ? (
        <p>No ideas yet.</p>
      ) : (
        ideas.map((idea) => {
          const likeCount = idea.likes?.length || 0;
          const favCount = idea.favorites?.length || 0;

          const userId = auth.currentUser?.uid;
          const isLiked = idea.likes?.includes(userId) || false;
          const isFavorited = idea.favorites?.includes(userId) || false;

          return (
            <div key={idea.id} className="border p-4 rounded shadow">
              {/* 标题 / 描述 / 作者 */}
              <h3 className="text-xl font-semibold">{idea.title}</h3>
              <p>{idea.description}</p>
              <p className="text-sm text-gray-500">Author: {idea.userId}</p>

              {/* 显示多媒体 */}
              {idea.mediaURLs && idea.mediaURLs.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {idea.mediaURLs.map((url, idx) => (
                    <div key={idx} className="max-w-xs">

                      {url.match(/\.(png|jpe?g|gif|webp|svg|bmp)$/i) ? (
                        <img
                          src={url}
                          alt={`Attachment-${idx}`}
                          className="max-h-48 object-cover"
                        />
                      ) : url.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                        <video
                          src={url}
                          controls
                          className="max-h-48"
                        />
                      ) : (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 underline"
                        >
                          查看附件 {idx + 1}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* 点赞 / 收藏 按钮 & 计数 */}
              <div className="mt-2 flex items-center space-x-4">
                <button
                  onClick={() => handleLike(idea)}
                  className="mt-2 bg-transparent text-blue-500 px-2 py-1 rounded"
                >
                  {isLiked ? "✅" : "👍"}
                </button>
                <p>点赞数：{likeCount}</p>

                <button
                  onClick={() => handleFavorite(idea)}
                  className="bg-transparent text-red-500 px-2 py-1 rounded"
                >
                  {isFavorited ? "❤️" : "🤍"}
                </button>
                <p>收藏数：{favCount}</p>
              </div>

              {/* 评论折叠/展开 */}
              <button
                onClick={() => toggleComments(idea.id)}
                className="text-blue-500 underline mt-2"
              >
                {expandedIdeaId === idea.id ? "收起评论" : "查看评论"}
              </button>
              {expandedIdeaId === idea.id && (
                <CommentList ideaId={idea.id} />
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
