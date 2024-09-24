import { Client, Account, Databases, Storage, Avatars } from "appwrite";

export const appwriteConfig = {
  url:process.env.NEXT_PUBLIC_APPWRITE_URL as string,
  projectId:process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID as string,
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string,
  storageId: process.env.NEXT_PUBLIC_APPWRITE_STORAGE_ID as string,
  userCollectionId: process.env.NEXT_PUBLIC_APPWRITE_USER_COLLECTION_ID as string,
  postCollectionId: process.env.NEXT_PUBLIC_APPWRITE_POST_COLLECTION_ID as string,
  savesCollectionId: process.env.NEXT_PUBLIC_APPWRITE_SAVES_COLLECTION_ID as string,
  commentsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_COMMENTS_COLLECTION_ID as string,
};



export const client = new Client();

client.setEndpoint(appwriteConfig.url);
client.setProject(appwriteConfig.projectId);


export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const avatars = new Avatars(client);
