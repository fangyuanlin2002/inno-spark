// src/pages/UserProfilePage.tsx
"use client";

import { useState, useEffect } from "react";
import { auth } from "../../firebase";
import Auth from "../../components/Auth";
import PostCard, { Post } from "../../components/PostCard";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import type { User as FirebaseUser } from "firebase/auth";

const db = getFirestore();
const storage = getStorage();

interface UserProfileData {
  userId: string;
  username: string;
  email: string;
  phoneNumber?: string;
  avatar?: string;
  profilePicture?: string;
  bio: string;
  gender?: string;
  birthday?: string;
  creationTime: string;
  location?: string;
  role: "entrepreneur" | "investor" | "expert";
  followers: string[];
  following: string[];
  likedPosts: string[];
  savedPosts: string[];
  myPosts: string[];
  connections: string[];
  investmentInterests?: string[];
  startupStage?: string;
  expertise?: string[];
}

export default function UserProfilePage() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserProfileData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // posts
  const [publishedPosts, setPublishedPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // which tab is active
  const [activeTab, setActiveTab] = useState<
    "published" | "liked" | "saved"
  >("published");

  // fetch auth user
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  // fetch profile data
  useEffect(() => {
    if (!user) return setLoadingProfile(false);
    (async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        setUserData(snap.data() as UserProfileData);
      }
      setLoadingProfile(false);
    })();
  }, [user]);

  // fetch posts
  useEffect(() => {
    if (!user) return setLoadingPosts(false);
    (async () => {
      const uid = user.uid;
      const postsCol = collection(db, "posts");
      const [pubSnap, likedSnap, savedSnap] = await Promise.all([
        getDocs(query(postsCol, where("authorId", "==", uid))),
        getDocs(query(postsCol, where("likedBy", "array-contains", uid))),
        getDocs(query(postsCol, where("savedBy", "array-contains", uid))),
      ]);
      const mapDocs = (snap: any) =>
        snap.docs.map((d: any) => ({ ...(d.data() as any), postId: d.id }));
      setPublishedPosts(mapDocs(pubSnap));
      setLikedPosts(mapDocs(likedSnap));
      setSavedPosts(mapDocs(savedSnap));
      setLoadingPosts(false);
    })();
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setUserData((d) => d && { ...d, [e.target.name]: e.target.value } as any);
  };

  // upload avatar
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !user) return;
    const file = e.target.files[0];
    const ref = storageRef(storage, `avatars/${user.uid}`);
    await uploadBytes(ref, file);
    const url = await getDownloadURL(ref);
    setUserData((d) => d && { ...d, avatar: url });
  };

  // upload banner
  const handleBannerChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files?.[0] || !user) return;
    const file = e.target.files[0];
    const ref = storageRef(storage, `banners/${user.uid}`);
    await uploadBytes(ref, file);
    const url = await getDownloadURL(ref);
    setUserData((d) => d && { ...d, profilePicture: url });
  };

  // save profile
  const saveProfile = async () => {
    if (!userData || !user) return;
    await updateDoc(doc(db, "users", user.uid), {
      username: userData.username,
      phoneNumber: userData.phoneNumber || "",
      bio: userData.bio,
      gender: userData.gender || "",
      birthday: userData.birthday || "",
      location: userData.location || "",
      role: userData.role,
      avatar: userData.avatar || "",
      profilePicture: userData.profilePicture || "",
    });
    setIsEditing(false);
  };

  // delete a post (only owner)
  const handleDelete = async (postId: string) => {
    if (!user) return;
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      await deleteDoc(doc(db, "posts", postId));
      // remove from local list:
      setPublishedPosts((ps) => ps.filter((p) => p.postId !== postId));
    } catch (err: any) {
      console.error(err);
      alert("Delete failed: " + err.message);
    }
  };

  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center h-64 text-black">
        Loading…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-black space-y-4">
        <p>Please log in to view your profile.</p>
        <Auth />
      </div>
    );
  }

  if (!userData) {
    return (
      <p className="text-center text-black py-20">No profile data found.</p>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black pb-10">
      {/* Banner + Avatar */}
      <div className="relative w-full h-40 bg-gray-200">
        <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2">
          {userData.avatar ? (
            <img
              src={userData.avatar}
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover border-4 border-white"
            />
          ) : (
            <div className="w-24 h-24 bg-gray-300 rounded-full border-4 border-white" />
          )}
          {isEditing && (
            <label className="block text-center mt-2 text-sm text-black cursor-pointer">
              Change Avatar
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {/* Basic Info Card */}
      <div className="max-w-md mx-auto bg-white shadow-lg rounded-xl mt-16 overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">{userData.username}</h1>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-blue-600 hover:underline text-sm"
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          </div>
          <p className="text-gray-700 mb-4">{userData.bio}</p>

          <div className="grid grid-cols-2 gap-4 text-sm">
            {/* Email */}
            <div>
              <div className="font-medium">Email</div>
              <div>{userData.email}</div>
            </div>
            {/* Phone */}
            <div>
              <div className="font-medium">Phone</div>
              {isEditing ? (
                <input
                  name="phoneNumber"
                  value={userData.phoneNumber || ""}
                  onChange={handleChange}
                  className="border p-1 rounded w-full"
                />
              ) : (
                <div>{userData.phoneNumber || "-"}</div>
              )}
            </div>
            {/* Location */}
            <div>
              <div className="font-medium">Location</div>
              {isEditing ? (
                <input
                  name="location"
                  value={userData.location || ""}
                  onChange={handleChange}
                  className="border p-1 rounded w-full"
                />
              ) : (
                <div>{userData.location || "-"}</div>
              )}
            </div>
            {/* Role */}
            <div>
              <div className="font-medium">Role</div>
              {isEditing ? (
                <select
                  name="role"
                  value={userData.role}
                  onChange={handleChange}
                  className="border p-1 rounded w-full"
                >
                  <option value="entrepreneur">Entrepreneur</option>
                  <option value="investor">Investor</option>
                  <option value="expert">Expert</option>
                </select>
              ) : (
                <div>{userData.role}</div>
              )}
            </div>
            {/* Gender */}
            <div>
              <div className="font-medium">Gender</div>
              {isEditing ? (
                <input
                  name="gender"
                  value={userData.gender || ""}
                  onChange={handleChange}
                  className="border p-1 rounded w-full"
                />
              ) : (
                <div>{userData.gender || "-"}</div>
              )}
            </div>
            {/* Birthday */}
            <div>
              <div className="font-medium">Birthday</div>
              {isEditing ? (
                <input
                  type="date"
                  name="birthday"
                  value={userData.birthday || ""}
                  onChange={handleChange}
                  className="border p-1 rounded w-full"
                />
              ) : (
                <div>{userData.birthday || "-"}</div>
              )}
            </div>
          </div>

          {isEditing && (
            <button
              onClick={saveProfile}
              className="mt-6 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
            >
              Save Changes
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-md mx-auto mt-8">
        <div className="flex justify-around border-b">
          <button
            onClick={() => setActiveTab("published")}
            className={`py-2 ${
              activeTab === "published"
                ? "border-b-2 border-black font-medium"
                : ""
            }`}
          >
            My Posts ({publishedPosts.length})
          </button>
          <button
            onClick={() => setActiveTab("liked")}
            className={`py-2 ${
              activeTab === "liked" ? "border-b-2 border-black font-medium" : ""
            }`}
          >
            Liked ({likedPosts.length})
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={`py-2 ${
              activeTab === "saved" ? "border-b-2 border-black font-medium" : ""
            }`}
          >
            Saved ({savedPosts.length})
          </button>
        </div>

        <div className="space-y-4 mt-4">
          {loadingPosts ? (
            <p>Loading posts…</p>
          ) : activeTab === "published" ? (
            publishedPosts.length > 0 ? (
              publishedPosts.map((p) => (
                <div key={p.postId}>
                  <PostCard post={p} />
                  <button
                    onClick={() => handleDelete(p.postId)}
                    className="text-red-600 hover:underline text-sm mt-1"
                  >
                    Delete
                  </button>
                </div>
              ))
            ) : (
              <p>No posts yet.</p>
            )
          ) : activeTab === "liked" ? (
            likedPosts.length > 0 ? (
              likedPosts.map((p) => <PostCard key={p.postId} post={p} />)
            ) : (
              <p>No liked posts.</p>
            )
          ) : savedPosts.length > 0 ? (
            savedPosts.map((p) => <PostCard key={p.postId} post={p} />)
          ) : (
            <p>No saved posts.</p>
          )}
        </div>
      </div>
    </div>
  );
}
