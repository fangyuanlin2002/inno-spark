"use client";

import { useState } from "react";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { auth } from "../firebase";

// User profile data interface for lookup
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

interface PostFormValues {
  title: string;
  content: string;
  tags: string; // comma‑separated
  visibility: "public" | "private" | "connectionsOnly";
  postType: "project" | "investment" | "article";
}

export default function PostForm() {
  const [values, setValues] = useState<PostFormValues>({
    title: "",
    content: "",
    tags: "",
    visibility: "public",
    postType: "article",
  });
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const db = getFirestore();
  const storage = getStorage();

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setFiles(Array.from(e.target.files));
  };

  const submitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) {
      alert("Please log in first!");
      return;
    }
    setUploading(true);

    try {
      // 1) create a new doc ref to get its ID
      const postsCol = collection(db, "posts");
      const newDocRef = doc(postsCol);

      // 2) upload each file to Storage under posts/{docId}/
      const mediaUrls: string[] = [];
      for (const file of files) {
        const fileRef = storageRef(storage, `posts/${newDocRef.id}/${file.name}`);
        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);
        mediaUrls.push(url);
      }

      // 3) parse tags
      const tagsArray = values.tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t);

      // 4) fetch the user's profile to get username
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        throw new Error("User profile not found");
      }
      const userProfile = userSnap.data() as UserProfileData;

      // 5) write the document with all required fields
      await setDoc(newDocRef, {
        postId: newDocRef.id,
        authorId: user.uid,
        authorName: userProfile.username || user.email || 'Unknown',
        title: values.title,
        content: values.content,
        media: mediaUrls,
        coverImage: mediaUrls.length > 0 ? mediaUrls[0] : null,
        tags: tagsArray,
        visibility: values.visibility,
        postType: values.postType,
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        creationTime: serverTimestamp(),
        likedBy: [],
        savedBy: [],
        status: "published",
      });

      // reset form
      setValues({
        title: "",
        content: "",
        tags: "",
        visibility: "public",
        postType: "article",
      });
      setFiles([]);
      alert("Post published!");
    } catch (err: any) {
      console.error(err);
      alert(`Failed to publish post: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form
      onSubmit={submitPost}
      className="flex flex-col space-y-4 border p-6 rounded-lg shadow bg-white text-black"
    >
      <h2 className="text-2xl font-bold">Create a Post</h2>

      <input
        name="title"
        type="text"
        placeholder="Title"
        value={values.title}
        onChange={handleChange}
        className="border p-2 rounded placeholder-black"
        required
      />

      <textarea
        name="content"
        placeholder="Write your content..."
        value={values.content}
        onChange={handleChange}
        className="border p-2 rounded h-32 placeholder-black"
        required
      />

      <input
        name="tags"
        type="text"
        placeholder="Tags (comma‑separated, optional)"
        value={values.tags}
        onChange={handleChange}
        className="border p-2 rounded placeholder-black"
      />

      <div>
        <label className="block mb-1">Upload images or videos:</label>
        <input
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileChange}
          className="block"
        />
      </div>

      <div className="flex space-x-4">
        <select
          name="visibility"
          value={values.visibility}
          onChange={handleChange}
          className="border p-2 rounded flex-1"
        >
          <option value="public">Public</option>
          <option value="private">Private</option>
          <option value="connectionsOnly">Connections Only</option>
        </select>

        <select
          name="postType"
          value={values.postType}
          onChange={handleChange}
          className="border p-2 rounded flex-1"
        >
          <option value="project">Project</option>
          <option value="investment">Investment</option>
          <option value="article">Article</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={uploading}
        className="px-4 py-2 rounded font-medium bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
      >
        {uploading ? "Publishing..." : "Publish Post"}
      </button>
    </form>
  );
}
