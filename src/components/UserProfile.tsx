"use client";
import { useState, useEffect } from "react";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { auth } from "../firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!userData) return;
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      console.log("No file was selected.");
      return;
    }
    if (!auth.currentUser) {
      console.log("User is not authenticated.");
      return;
    }
    const file = e.target.files[0];
    console.log("File selected:", file);

    // Create a reference in Firebase Storage
    const storageRef = ref(storage, `profilePictures/${auth.currentUser.uid}`);
    try {
      console.log("Attempting to upload file...");
      const snapshot = await uploadBytes(storageRef, file);
      console.log("File uploaded successfully. Snapshot:", snapshot);
      
      console.log("Retrieving download URL...");
      const downloadURL = await getDownloadURL(storageRef);
      console.log("Download URL retrieved:", downloadURL);

      // Update state with the new profile picture URL
      setUserData((prev) =>
        prev ? { ...prev, profilePicture: downloadURL } : null
      );
    } catch (error) {
      console.error("Error during file upload or URL retrieval:", error);
    }
  };

  const handleSave = async () => {
    if (!auth.currentUser || !userData) {
      console.log("No authenticated user or user data missing.");
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
        profilePicture: userData.profilePicture || "",
      });
      console.log("User profile updated successfully in Firestore.");
      alert("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update Firestore profile:", error);
    }
  };

  if (loading) {
    return <div className="text-xl font-bold">🔄 Loading...</div>;
  }

  if (!userData) {
    return (
      <div className="text-xl font-bold">
        ⚠️ No profile found. Please log in.
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 border rounded shadow-lg">
      <h2 className="text-2xl font-bold mb-2">👤 User Profile</h2>
      <p className="mb-4 text-sm text-gray-600">
        Update your account information below. You can edit your username,
        phone number, bio, location, and profile picture.
      </p>
      {/* Profile picture at the very top */}
      <div className="mb-4 flex flex-col items-center">
        <div className="relative">
          {userData.profilePicture ? (
            <img
              src={userData.profilePicture}
              alt="Profile Picture"
              className="w-32 h-32 object-cover rounded-full"
            />
          ) : (
            <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center">
              {isEditing ? (
                <span className="text-gray-500">Add Image</span>
              ) : (
                <span className="text-gray-500">No Image</span>
              )}
            </div>
          )}
          {isEditing && (
            <label
              htmlFor="profilePictureInput"
              className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full cursor-pointer"
            >
              <span className="text-white text-lg">+</span>
            </label>
          )}
        </div>
        <input
          id="profilePictureInput"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      {/* Form fields */}
      <div className="space-y-4">
        <div>
          <label htmlFor="username" className="block font-semibold mb-1">
            Username
          </label>
          <input
            id="username"
            type="text"
            name="username"
            value={userData.username}
            onChange={handleChange}
            className="border p-2 w-full rounded"
            disabled={!isEditing}
          />
        </div>
        <div>
          <label htmlFor="email" className="block font-semibold mb-1">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={userData.email}
            className="border p-2 w-full rounded"
            disabled
          />
        </div>
        <div>
          <label htmlFor="phoneNumber" className="block font-semibold mb-1">
            Phone Number
          </label>
          <input
            id="phoneNumber"
            type="text"
            name="phoneNumber"
            value={userData.phoneNumber || ""}
            onChange={handleChange}
            className="border p-2 w-full rounded"
            disabled={!isEditing}
          />
        </div>
        <div>
          <label htmlFor="bio" className="block font-semibold mb-1">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            value={userData.bio}
            onChange={handleChange}
            className="border p-2 w-full rounded"
            disabled={!isEditing}
          />
        </div>
        <div>
          <label htmlFor="location" className="block font-semibold mb-1">
            Location
          </label>
          <input
            id="location"
            type="text"
            name="location"
            value={userData.location || ""}
            onChange={handleChange}
            className="border p-2 w-full rounded"
            disabled={!isEditing}
          />
        </div>
        {isEditing ? (
          <button
            onClick={handleSave}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Save
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
}
