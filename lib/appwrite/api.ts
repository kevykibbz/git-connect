import { ID, ImageGravity, Models, Query } from "appwrite";

import { appwriteConfig, account, databases, storage, avatars } from "./config";
import {
  IUpdatePost,
  INewPost,
  INewUser,
  IUpdateUser,
  IAuthUser,
  IUComment,
} from "@/types";

// ============================================================
// AUTH
// ============================================================

// ============================== SIGN UP

function generateRandomUsername(name: string): string {
  const randomSuffix = Math.floor(Math.random() * 10000);
  return `${name}_${randomSuffix}`;
}

export async function createUserAccount(user: INewUser) {
  try {
    const generatedUsername = generateRandomUsername(user.name);

    const newAccount = await account.create(
      ID.unique(),
      user.email,
      user.password,
      user.name
    );

    if (!newAccount) throw Error;

    const avatarUrl = avatars.getInitials(user.name);

    const newUser = await saveUserToDB({
      accountId: newAccount.$id,
      name: newAccount.name,
      email: newAccount.email,
      username: generatedUsername,
      imageUrl: avatarUrl,
    });

    return newUser;
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "Failed to fetch") {
        throw new Error(
          "Network error. Please check your internet connection."
        );
      }
      throw new Error(error.message || "An unexpected error occurred.");
    } else {
      throw new Error("An unknown error occurred.");
    }
  }
}

// ============================== SAVE USER TO DB
export async function saveUserToDB(user: {
  accountId: string;
  email: string;
  name: string;
  imageUrl: URL;
  username?: string;
}) {
  try {
    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      user
    );

    return newUser;
  } catch (error) {
    console.log(error);
  }
}

// ============================== SIGN IN
export async function signInAccount(user: IAuthUser) {
  try {
    const currentSession = await account
      .getSession("current")
      .catch(() => null);
    if (currentSession) {
      return currentSession;
    }

    const session = await account.createEmailPasswordSession(
      user.email,
      user.password
    );

    return session;
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "Failed to fetch") {
        throw new Error(
          "Network error. Please check your internet connection."
        );
      }
      throw new Error(error.message || "An unexpected error occurred.");
    } else {
      throw new Error("An unknown error occurred.");
    }
  }
}

// ============================== GET ACCOUNT
export async function getAccount() {
  try {
    const currentAccount = await account.get();

    return currentAccount;
  } catch (error) {
    console.log(error);
  }
}

export async function isUserLoggedIn() {
  try {
    const session = await account.getSession("current");
    return !!session;
  } catch (error) {
    console.error("Error checking session:", error);
    return false;
  }
}

// ============================== GET USER
export async function getCurrentUser() {
  try {
    const currentAccount = await getAccount();
    if (!currentAccount) throw new Error("No current account");

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser || currentUser.documents.length === 0) {
      throw new Error("No current user found in database");
    }

    return currentUser.documents[0];
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
}

// ============================== SIGN OUT
export async function signOutAccount() {
  try {
    const session = await account.deleteSession("current");

    return session;
  } catch (error) {
    console.log(error);
  }
}

// ============================================================
// POSTS
// ============================================================

// ============================== CREATE POST
export async function createPost(post: INewPost) {
  try {
    let fileUrl: string | undefined;
    let uploadedFileId: string | undefined;

    // Check if a file exists and upload it
    if (post.file && post.file.length > 0) {
      const uploadedFile = await uploadFile(post.file[0]);
      if (!uploadedFile) throw new Error("File upload failed");

      // Get file URL
      const previewUrl = getFilePreview(uploadedFile.$id);
      if (!previewUrl) {
        await deleteFile(uploadedFile.$id);
        throw new Error("Failed to retrieve file URL");
      }

      fileUrl = previewUrl.toString(); // Ensure it's a string
      uploadedFileId = uploadedFile.$id;
    }

    // Create the post object dynamically
    const newPostData: Record<string, string | string[] | undefined> = {
      creator: post.userId,
      caption: post.caption,
      tags: post.tags?.replace(/ /g, "").split(",") || [],
    };

    // Conditionally include optional fields
    if (fileUrl) {
      newPostData.imageUrl = fileUrl; // Valid URL
    }
    if (uploadedFileId) {
      newPostData.imageId = uploadedFileId; // Can be undefined if no file uploaded
    }
    if (post.location) {
      newPostData.location = post.location; // Optional location
    }

    // Create post
    const newPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      ID.unique(),
      newPostData
    );

    return newPost;
  } catch (error) {
    console.error("Error creating post:", error);
    throw new Error("Failed to create post");
  }
}

// ============================== UPLOAD FILE
export async function uploadFile(file: File) {
  try {
    const uploadedFile = await storage.createFile(
      appwriteConfig.storageId,
      ID.unique(),
      file
    );

    return uploadedFile;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET FILE URL
export function getFilePreview(fileId: string) {
  try {
    const fileUrl = storage.getFilePreview(
      appwriteConfig.storageId,
      fileId,
      2000,
      2000,
      ImageGravity.Top,
      100
    );

    if (!fileUrl) throw Error;

    return fileUrl;
  } catch (error) {
    console.log(error);
  }
}

// ============================== DELETE FILE
export async function deleteFile(fileId: string) {
  try {
    await storage.deleteFile(appwriteConfig.storageId, fileId);

    return { status: "ok" };
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET POSTS
export async function searchPosts(searchTerm: string) {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.search("caption", searchTerm)]
    );

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.log(error);
  }
}

export async function getInfinitePosts({ pageParam }: { pageParam: number }) {
  const queries: (
    | ReturnType<typeof Query.orderDesc>
    | ReturnType<typeof Query.limit>
  )[] = [Query.orderDesc("$updatedAt"), Query.limit(9)];

  if (pageParam) {
    queries.push(Query.cursorAfter(pageParam.toString()));
  }

  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      queries
    );

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET POST BY ID
export async function getPostById(postId?: string) {
  if (!postId) throw Error;

  try {
    const post = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    if (!post) throw Error;

    return post;
  } catch (error) {
    console.log(error);
  }
}

// ============================== UPDATE POST
export async function updatePost(post: IUpdatePost) {
  const hasFileToUpdate = post.file.length > 0;

  try {
    let image = {
      imageUrl: post.imageUrl,
      imageId: post.imageId,
    };

    if (hasFileToUpdate) {
      // Upload new file to appwrite storage
      const uploadedFile = await uploadFile(post.file[0]);
      if (!uploadedFile) throw Error;

      // Get new file url
      const fileUrl = getFilePreview(uploadedFile.$id);
      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw Error;
      }

      image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
    }

    // Convert tags into array
    const tags = post.tags?.replace(/ /g, "").split(",") || [];

    //  Update post
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      post.postId,
      {
        caption: post.caption,
        imageUrl: image.imageUrl,
        imageId: image.imageId,
        location: post.location,
        tags: tags,
      }
    );

    // Failed to update
    if (!updatedPost) {
      // Delete new file that has been recently uploaded
      if (hasFileToUpdate) {
        await deleteFile(image.imageId);
      }

      // If no new file uploaded, just throw error
      throw Error;
    }

    // Safely delete old file after successful update
    if (hasFileToUpdate) {
      await deleteFile(post.imageId);
    }

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}

// ============================== DELETE POST
export async function deletePost(postId?: string, imageId?: string) {
  if (!postId || !imageId) return;

  try {
    const statusCode = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    if (!statusCode) throw Error;

    await deleteFile(imageId);

    return { status: "Ok" };
  } catch (error) {
    console.log(error);
  }
}

// ============================== LIKE  POST
export async function likePost(postId: string, userId: string): Promise<Models.Document | undefined> {
  try {
    // Step 1: Check if the user has already liked this post
    const existingLikes = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.likesCollectionId,
      [
        Query.equal("userId", userId),  // Check if the user has already liked
        Query.equal("postId", postId)   // Check the post
      ]
    );

    // If the user has already liked the post, do nothing and return
    if (existingLikes.total > 0) {
      console.log("User has already liked this post.");
      return undefined;
    }

    // Step 2: Proceed to like the post if no previous like was found
    const newLike = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.likesCollectionId,
      ID.unique(),
      {
        userId: userId,
        postId: postId,
        users:userId,
        post_likes:postId,
        createdAt: new Date().toISOString(),
      }
    );

    // Step 3: Check and delete existing unlike record, if any
    const unlikes = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.unlikesCollectionId,
      [
        Query.equal("userId", userId),  // Filter by the same user
        Query.equal("postId", postId)    // Filter by the same post
      ]
    );

    if (unlikes.total > 0) {
      const unlikeDocumentId = unlikes.documents[0].$id;
      await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.unlikesCollectionId,
        unlikeDocumentId
      );
    }

    return newLike; // Return the newly created like document

  } catch (error) {
    console.log("Error liking the post:", error);
  }
}



// ============================== UNLIKE  POST
export async function unlikePost(postId: string, userId: string): Promise<Models.Document | undefined> {
  try {
    // Step 1: Check if the user has already unliked this post
    const existingUnlikes = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.unlikesCollectionId,
      [
        Query.equal("userId", userId),  // Check if the user has already unliked
        Query.equal("postId", postId)   // Check the post
      ]
    );

    // If the user has already unliked the post, do nothing and return
    if (existingUnlikes.total > 0) {
      console.log("User has already unliked this post.");
      return undefined;
    }

    // Step 2: Proceed to unlike the post if no previous unlike was found
    const newUnlike = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.unlikesCollectionId, 
      ID.unique(),
      {
        userId: userId,
        postId: postId,
        users:userId,
        post_unlikes:postId,
        createdAt: new Date().toISOString(),
      }
    );

    // Step 3: Check and delete existing like record, if any
    const likes = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.likesCollectionId, // Likes collection
      [
        Query.equal("userId", userId),  // Filter by the same user
        Query.equal("postId", postId)    // Filter by the same post
      ]
    );

    if (likes.total > 0) {
      const likeDocumentId = likes.documents[0].$id;
      await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.likesCollectionId, // Likes collection
        likeDocumentId
      );
    }

    return newUnlike; // Return the newly created unlike document

  } catch (error) {
    console.log("Error creating unlike reaction:", error);
  }
}



// ============================== SAVE POST
export async function savePost(userId: string, postId: string) {
  try {
    const updatedPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      ID.unique(),
      {
        user: userId,
        post: postId,
      }
    );

    if (!updatedPost) throw Error;

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}
// ============================== DELETE SAVED POST
export async function deleteSavedPost(savedRecordId: string) {
  try {
    const statusCode = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      savedRecordId
    );

    if (!statusCode) throw Error;

    return { status: "Ok" };
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET USER'S POST
export async function getUserPosts(userId?: string) {
  if (!userId) return;

  try {
    const post = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.equal("creator", userId), Query.orderDesc("$createdAt")]
    );

    if (!post) throw Error;

    return post;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET POPULAR POSTS (BY HIGHEST LIKE COUNT)
export async function getRecentPosts() {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.orderDesc("$createdAt"), Query.limit(20)]
    );

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.log(error);
  }
}

// ============================================================
// USER
// ============================================================

// ============================== GET USERS
export async function getUsers(limit?: number) {
  const queries: ReturnType<typeof Query.orderDesc>[] = [
    Query.orderDesc("$createdAt"),
  ];

  if (limit) {
    queries.push(Query.limit(limit));
  }

  try {
    const users = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      queries
    );

    if (!users) throw Error;

    return users;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET USER BY ID
export async function getUserById(userId: string) {
  try {
    const user = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userId
    );

    if (!user) throw Error;

    return user;
  } catch (error) {
    console.log(error);
  }
}

// ============================== UPDATE USER
export async function updateUser(user: IUpdateUser) {
  const hasFileToUpdate = user.file.length > 0;
  try {
    let image = {
      imageUrl: user.imageUrl,
      imageId: user.imageId,
    };

    if (hasFileToUpdate) {
      // Upload new file to appwrite storage
      const uploadedFile = await uploadFile(user.file[0]);
      if (!uploadedFile) throw Error;

      // Get new file url
      const fileUrl = getFilePreview(uploadedFile.$id);
      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw Error;
      }

      image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
    }

    //  Update user
    const updatedUser = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      user.userId,
      {
        name: user.name,
        education: user.education,
        work_experience: user.work_experience,
        imageUrl: image.imageUrl,
        imageId: image.imageId,
      }
    );

    // Failed to update
    if (!updatedUser) {
      // Delete new file that has been recently uploaded
      if (hasFileToUpdate) {
        await deleteFile(image.imageId);
      }
      // If no new file uploaded, just throw error
      throw Error;
    }

    // Safely delete old file after successful update
    if (user.imageId && hasFileToUpdate) {
      await deleteFile(user.imageId);
    }

    return updatedUser;
  } catch (error) {
    console.log(error);
  }
}


export async function isPostValid(postId: string) {
  try {
    const post = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );
    return post ? true : false; // Return true if post exists
  } catch (error) {
    console.error("Error fetching post:", error);
    return false; // Return false if there's an error
  }
}


export async function createComment(commentData: IUComment) {
  // Validate postId
  const isValidPost = await isPostValid(commentData.postId);
  if (!isValidPost) {
    throw new Error("Invalid postId. Comment cannot be created.");
  }
  try {
    const newComment = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.commentsCollectionId,
      ID.unique(),{
        user: commentData.userId,
        post: commentData.postId,
        comment: commentData.comment,
        createdAt: new Date().toISOString(),
      }
    );

    return newComment;
  } catch (error) {
    console.error("Error creating comment:", error);
    throw new Error("Failed to create comment");
  }
}

export async function getRecentComments(postId: string) {
  try {
    // Check if postId is valid
    if (!postId) {
      throw new Error("Invalid postId");
    }

    const comments = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.commentsCollectionId,
      [
        Query.equal('post', postId), // Filter by postId
        Query.orderDesc('$createdAt'), // Order by creation date, descending
        Query.limit(20), // Limit to the most recent 20 comments
      ]
    );

    if (!comments) throw new Error("No comments found");

    return comments;
  } catch (error) {
    console.error("Error fetching recent comments:", error);
    throw new Error("Failed to fetch comments");
  }
}
