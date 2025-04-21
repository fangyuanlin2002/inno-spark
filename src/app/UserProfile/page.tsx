"use client";

import { useState, useEffect } from "react";
import { auth } from "../../firebase";
import Auth from "../../components/Auth";
import {
  getFirestore, doc, getDoc, updateDoc
} from "firebase/firestore";
import {
  getStorage, ref, uploadBytes, getDownloadURL
} from "firebase/storage";

const db = getFirestore();
const storage = getStorage();

interface UserProfileData {
  userId: string;
  username: string;
  email: string;
  phoneNumber?: string;
  profilePicture?: string;
  bio: string;
  location?: string;
}

export default function UserProfilePage() {
  const [userData, setUserData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    (async () => {
      if (!auth.currentUser) {
        setLoading(false);
        return;
      }
      const snap = await getDoc(doc(db, "users", auth.currentUser.uid));
      if (snap.exists()) setUserData(snap.data() as UserProfileData);
      setLoading(false);
    })();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setUserData((d) => d && { ...d, [e.target.name]: e.target.value });
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !auth.currentUser) return;
    const storageRef = ref(storage, `profilePictures/${auth.currentUser.uid}`);
    await uploadBytes(storageRef, e.target.files[0]);
    const url = await getDownloadURL(storageRef);
    setUserData((d) => d && { ...d, profilePicture: url });
  };

  const save = async () => {
    if (!userData || !auth.currentUser) return;
    await updateDoc(doc(db, "users", auth.currentUser.uid), {
      username: userData.username,
      phoneNumber: userData.phoneNumber ?? "",
      bio: userData.bio,
      location: userData.location ?? "",
      profilePicture: userData.profilePicture ?? "",
    });
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-900">
        Loading…
      </div>
    );
  }

  if (!auth.currentUser) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-900 space-y-4">
        <p>You need to log in to view your profile.</p>
        <Auth />
      </div>
    );
  }

  if (!userData) {
    return (
      <p className="text-center text-gray-900 py-20">
        No profile data found.
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-indigo-50 py-10 text-gray-900">
      <div className="max-w-md mx-auto bg-white shadow-lg rounded-xl overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Your Profile</h1>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-indigo-600 hover:underline text-sm"
            >
              {isEditing ? "Cancel" : "Edit"}
            </button>
          </div>

          {/* Avatar */}
          <div className="flex flex-col items-center mb-6">
            {userData.profilePicture ? (
              <img
                src={userData.profilePicture}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 bg-gray-200 rounded-full" />
            )}
            {isEditing && (
              <label className="mt-2 px-3 py-1 bg-indigo-600 text-white rounded cursor-pointer text-sm">
                Change
                <input type="file" className="hidden" onChange={handleFile} />
              </label>
            )}
          </div>

          {/* Fields */}
          <div className="space-y-4">
            {(["username", "email", "phoneNumber", "bio", "location"] as const).map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium mb-1 capitalize">
                  {field}
                </label>
                {field === "bio" ? (
                  <textarea
                    name={field}
                    value={(userData as any)[field] || ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full border rounded p-2 resize-none"
                  />
                ) : (
                  <input
                    type={field === "email" ? "email" : "text"}
                    name={field}
                    value={(userData as any)[field] || ""}
                    onChange={handleChange}
                    disabled={field === "email" || !isEditing}
                    className="w-full border rounded p-2"
                  />
                )}
              </div>
            ))}
          </div>

          {isEditing && (
            <button
              onClick={save}
              className="mt-6 w-full bg-green-600 text-white py-2 rounded-lg shadow hover:bg-green-700 transition"
            >
              Save
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
