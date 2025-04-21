"use client";

import Auth from "../../components/Auth";
import IdeaForm from "../../components/IdeaForm";
import IdeaList from "../../components/IdeaList";
import CompleteProfileForm from "../../components/CompleteProfileForm";
import { auth } from "../../firebase";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { useState, useEffect } from "react";
import Link from "next/link";

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

export default function Home() {
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [showInfoForm, setShowInfoForm] = useState(false);
  const [tempUserData, setTempUserData] = useState<Partial<UserProfileData>>({});

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      console.log("Auth state changed. Current user:", currentUser);

      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          console.log("User found in Firestore:", userSnap.data());
          setUserProfile(userSnap.data() as UserProfileData);
        } else {
          console.log("User not found in Firestore. Prompting for additional info.");
          setTempUserData({
            userId: currentUser.uid,
            username: currentUser.displayName || "",
            email: currentUser.email || "",
          });
          setShowInfoForm(true);
        }
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setTempUserData({ ...tempUserData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tempUserData.userId || !tempUserData.username || !tempUserData.email) {
      alert("Username and email are required!");
      return;
    }

    const newUserProfile: UserProfileData = {
      userId: tempUserData.userId || "", // Ensures it's never undefined
      username: tempUserData.username || "New User",
      email: tempUserData.email || "",
      phoneNumber: tempUserData.phoneNumber || "",
      avatar: "",
      profilePicture: "",
      bio: tempUserData.bio || "",
      gender: tempUserData.gender || "",
      birthday: tempUserData.birthday || "",
      creationTime: new Date().toISOString(),
      location: tempUserData.location || "",
      role: (tempUserData.role as "entrepreneur" | "investor" | "expert") || "entrepreneur",
      followers: [],
      following: [],
      likedPosts: [],
      savedPosts: [],
      myPosts: [],
      connections: [],
      investmentInterests: tempUserData.investmentInterests || [],
      startupStage: tempUserData.startupStage || "",
      expertise: tempUserData.expertise || [],
    };
    

    console.log("Saving new user profile to Firestore:", newUserProfile);

    try {
      await setDoc(doc(db, "users", newUserProfile.userId), newUserProfile);
      setUserProfile(newUserProfile);
      setShowInfoForm(false);
    } catch (error) {
      console.error("Error saving user profile:", error);
      alert("Failed to save profile. Please try again.");
    }
  };

  const handleProfileFormSubmit = async (newProfile: UserProfileData) => {
    console.log("Saving new user profile to Firestore:", newProfile);
    try {
      await setDoc(doc(db, "users", newProfile.userId), newProfile);
      setUserProfile(newProfile);
      setShowInfoForm(false);
    } catch (error) {
      console.error("Error saving user profile:", error);
      alert("Failed to save profile. Please try again.");
    }
  };

  if (loading) {
    return <div className="text-xl font-bold">🔄 Loading...</div>;
  }

  if (showInfoForm) {
    <CompleteProfileForm
        userId={tempUserData.userId!}
        initialData={tempUserData}
        onSubmit={handleProfileFormSubmit}
      />
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-6 p-6">
      <h1 className="text-3xl font-bold">🚀 欢迎来到 InnoSpark</h1>
      <Auth />
      {userProfile ? (
        <>
          {/* navigate to your profile page at /UserProfile */}
          <Link href="/UserProfile" passHref>
            <button className="bg-gray-700 text-white px-4 py-2 rounded mt-4">
              Profile
            </button>
          </Link>

          <IdeaForm />
        </>
      ) : (
        <p className="text-lg">Please log in to access your profile.</p>
      )}
      <IdeaList />
    </div>
  );
}


