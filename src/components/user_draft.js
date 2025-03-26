interface User {
  userId: string; // 用户唯一标识
  username: string; // 用户名（唯一）
  password: string; // 密码（需加密存储）
  email: string; // 邮箱（用于登录和验证）
  phoneNumber?: string; // 手机号（可选）
  avatar?: string; // 头像URL（可选，默认占位符）
  profilePicture?: string; // 个人主页背景图URL（可选）
  bio: string; // 个人简介（初始化为空）
  gender?: string; // 性别（可选）
  birthday?: string; // 生日（可选）
  creationTime: string; // 用户注册时间
  location?: string; // 地理位置（可选）
  role: ("entrepreneur" | "investor" | "expert")[]; // 用户角色：创业者、投资人、专家（支持多选）
  followers: string[]; // 粉丝列表（存储其他用户的userId）
  following: string[]; // 关注列表（存储其他用户的userId）
  likedPosts: string[]; // 点赞过的帖子ID列表
  savedPosts: string[]; // 收藏过的帖子ID列表
  myPosts: string[]; // 用户发布的帖子ID列表
  connections: string[]; // 用户的人脉列表（存储其他用户的userId）
  investmentInterests?: string[]; // 投资兴趣领域（可选，适用于投资人）
  startupStage?: string; // 创业阶段（可选，适用于创业者）
  expertise?: string[]; // 专业领域（可选，适用于专家）
}

// 提供默认头像URL
const DEFAULT_AVATAR = "https://example.com/default-avatar.png";

// 创建一个示例用户
const exampleUser: User = {
  userId: "123456",
  username: "startupFounder",
  password: "hashed_password", // 需加密
  email: "founder@example.com",
  bio: "",
  creationTime: new Date().toISOString(),
  role: ["entrepreneur"], // 角色支持多选
  followers: [],
  following: [],
  likedPosts: [],
  savedPosts: [],
  myPosts: [],
  connections: [],
  avatar: DEFAULT_AVATAR,
};

console.log(exampleUser);
