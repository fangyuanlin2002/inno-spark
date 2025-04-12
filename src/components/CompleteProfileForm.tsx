"use client";

import { useState } from "react";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export interface UserProfileData {
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

interface CompleteProfileFormProps {
  userId: string;
  initialData?: Partial<UserProfileData>;
  onSubmit: (profile: UserProfileData) => void;
}

export default function CompleteProfileForm({
  userId,
  initialData = {},
  onSubmit,
}: CompleteProfileFormProps) {
  // Internal state for the form data.
  const [formData, setFormData] = useState<Partial<UserProfileData>>(initialData);
  const storage = getStorage();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle fields that are represented as comma-separated values
  const handleCommaSeparatedChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: "investmentInterests" | "expertise"
  ) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value.split(",").map((s) => s.trim()).filter((s) => s !== ""),
    }));
  };

  // Handle file input change for the profile picture
  const handleProfilePictureChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    const file = e.target.files[0];
    try {
      // Create a reference in Firebase Storage using the userId and file name.
      const storageRef = ref(storage, `profilePictures/${userId}/${file.name}`);
      // Upload the file
      const snapshot = await uploadBytes(storageRef, file);
      console.log("Profile picture uploaded:", snapshot);
      // Retrieve the file's download URL
      const url = await getDownloadURL(storageRef);
      console.log("Download URL:", url);
      // Update form data with the download URL
      setFormData((prev) => ({ ...prev, profilePicture: url }));
    } catch (error) {
      console.error("Error uploading profile picture:", error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate required fields.
    if (!formData.username || !formData.email || !formData.role) {
      alert("Please fill out all required fields (Username, Email, and Role).");
      return;
    }
    // Build the complete profile using defaults for arrays and empty strings for optionals.
    const completeProfile: UserProfileData = {
      userId,
      username: formData.username,
      email: formData.email,
      phoneNumber: formData.phoneNumber || "",
      avatar: "",
      profilePicture: formData.profilePicture || "",
      bio: formData.bio || "",
      gender: formData.gender || "",
      birthday: formData.birthday || "",
      creationTime: new Date().toISOString(),
      location: formData.location || "",
      role: formData.role as "entrepreneur" | "investor" | "expert",
      followers: [],
      following: [],
      likedPosts: [],
      savedPosts: [],
      myPosts: [],
      connections: [],
      investmentInterests: formData.investmentInterests || [],
      startupStage: formData.startupStage || "",
      expertise: formData.expertise || [],
    };

    onSubmit(completeProfile);
  };

  return (
    <div className="max-w-md mx-auto p-6 border rounded shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Complete Your Profile</h2>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        {/* Username (required) */}
        <div>
          <label className="block mb-1 font-semibold">Username*</label>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username || ""}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
        </div>
        {/* Email (required, disabled) */}
        <div>
          <label className="block mb-1 font-semibold">Email*</label>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email || ""}
            onChange={handleChange}
            required
            disabled
            className="w-full border p-2 rounded bg-gray-100"
          />
        </div>
        {/* Optional: Profile Picture Upload */}
        <div>
          <label className="block mb-1 font-semibold">Profile Picture (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleProfilePictureChange}
            className="w-full"
          />
          {formData.profilePicture && (
            <img
              src={formData.profilePicture}
              alt="Profile Preview"
              className="mt-2 w-20 h-20 rounded-full object-cover"
            />
          )}
        </div>
        {/* Phone Number (optional) */}
        <div>
          <label className="block mb-1 font-semibold">Phone Number</label>
          <input
            type="text"
            name="phoneNumber"
            placeholder="Phone Number"
            value={formData.phoneNumber || ""}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>
        {/* Bio (optional) */}
        <div>
          <label className="block mb-1 font-semibold">Bio</label>
          <textarea
            name="bio"
            placeholder="Tell us about yourself"
            value={formData.bio || ""}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          ></textarea>
        </div>
        {/* Gender (optional) */}
        <div>
          <label className="block mb-1 font-semibold">Gender</label>
          <select
            name="gender"
            value={formData.gender || ""}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        {/* Birthday (optional) */}
        <div>
          <label className="block mb-1 font-semibold">Birthday</label>
          <input
            type="date"
            name="birthday"
            value={formData.birthday || ""}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>
        {/* Location (optional) */}
        <div>
          <label className="block mb-1 font-semibold">Location</label>
          <input
            type="text"
            name="location"
            placeholder="Your location"
            value={formData.location || ""}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>
        {/* Role (required) */}
        <div>
          <label className="block mb-1 font-semibold">Role*</label>
          <select
            name="role"
            value={formData.role || ""}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          >
            <option value="">Select Role</option>
            <option value="entrepreneur">Entrepreneur</option>
            <option value="investor">Investor</option>
            <option value="expert">Expert</option>
          </select>
        </div>
        {/* Investment Interests (optional - comma separated) */}
        <div>
          <label className="block mb-1 font-semibold">Investment Interests</label>
          <input
            type="text"
            name="investmentInterests"
            placeholder="E.g., Tech, Retail"
            value={
              formData.investmentInterests
                ? formData.investmentInterests.join(", ")
                : ""
            }
            onChange={(e) => handleCommaSeparatedChange(e, "investmentInterests")}
            className="w-full border p-2 rounded"
          />
        </div>
        {/* Startup Stage (optional) */}
        <div>
          <label className="block mb-1 font-semibold">Startup Stage</label>
          <input
            type="text"
            name="startupStage"
            placeholder="Startup Stage"
            value={formData.startupStage || ""}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>
        {/* Expertise (optional - comma separated) */}
        <div>
          <label className="block mb-1 font-semibold">Expertise</label>
          <input
            type="text"
            name="expertise"
            placeholder="E.g., Marketing, Product"
            value={formData.expertise ? formData.expertise.join(", ") : ""}
            onChange={(e) => handleCommaSeparatedChange(e, "expertise")}
            className="w-full border p-2 rounded"
          />
        </div>
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
          Save Profile
        </button>
      </form>
    </div>
  );
}
