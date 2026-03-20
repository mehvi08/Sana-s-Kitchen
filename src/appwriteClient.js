import { Client, Account, Databases, Storage } from 'appwrite';

const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// IDs for database and collections used in this project
export const APPWRITE_CONFIG = {
  databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
  menuCollectionId: import.meta.env.VITE_APPWRITE_MENU_COLLECTION_ID,
  ordersCollectionId: import.meta.env.VITE_APPWRITE_ORDERS_COLLECTION_ID,
  profilesCollectionId: import.meta.env.VITE_APPWRITE_PROFILES_COLLECTION_ID,
  menuImagesBucketId: import.meta.env.VITE_APPWRITE_MENU_IMAGES_BUCKET_ID,
  adminEmail: import.meta.env.VITE_ADMIN_EMAIL,
};

