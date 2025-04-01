"use client";

import { useState, useEffect } from "react";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { auth } from "../firebase";

const db = getFirestore();

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

export default function UserProfile() {
  const [userData, setUserData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth.currentUser) {
        console.log("No user logged in.");
        return;
      }

      console.log("Fetching user data for:", auth.currentUser.uid);
      const userRef = doc(db, "users", auth.currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        console.log("User data found in Firestore:", userSnap.data());
        setUserData(userSnap.data() as UserProfileData);
      } else {
        console.log("User profile does not exist in Firestore.");
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!userData) return;
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!auth.currentUser || !userData) {
      console.log("No authenticated user or userData missing.");
      return;
    }

    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      console.log("Updating user profile with data:", userData);
      await updateDoc(userRef, {
        username: userData.username,
        phoneNumber: userData.phoneNumber || "",
        bio: userData.bio || "",
        location: userData.location || "",
      });

      alert("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  if (loading) {
    return <div className="text-xl font-bold">🔄 Loading...</div>;
  }

  if (!userData) {
    return <div className="text-xl font-bold">⚠️ No profile found. Please log in.</div>;
  }

  return (
    <div className="max-w-md mx-auto p-6 border rounded shadow-lg">
      <h2 className="text-2xl font-bold mb-4">👤 User Profile</h2>
      <div className="space-y-4">
        <input
          type="text"
          name="username"
          value={userData.username}
          onChange={handleChange}
          className="border p-2 w-full rounded"
          disabled={!isEditing}
        />
        <input
          type="email"
          name="email"
          value={userData.email}
          className="border p-2 w-full rounded"
          disabled
        />
        <input
          type="text"
          name="phoneNumber"
          value={userData.phoneNumber || ""}
          onChange={handleChange}
          className="border p-2 w-full rounded"
          disabled={!isEditing}
        />
        <textarea
          name="bio"
          value={userData.bio}
          onChange={handleChange}
          className="border p-2 w-full rounded"
          disabled={!isEditing}
        />
        <input
          type="text"
          name="location"
          value={userData.location || ""}
          onChange={handleChange}
          className="border p-2 w-full rounded"
          disabled={!isEditing}
        />
        {isEditing ? (
          <button onClick={handleSave} className="bg-green-500 text-white px-4 py-2 rounded">
            Save
          </button>
        ) : (
          <button onClick={() => setIsEditing(true)} className="bg-blue-500 text-white px-4 py-2 rounded">
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
}