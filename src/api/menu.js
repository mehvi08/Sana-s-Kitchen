import { ID, Query } from 'appwrite';
import { databases, APPWRITE_CONFIG } from '../appwriteClient';

export async function fetchMenuItems() {
  const res = await databases.listDocuments(
    APPWRITE_CONFIG.databaseId,
    APPWRITE_CONFIG.menuCollectionId,
    [Query.equal('isAvailable', true)],
  );
  return res.documents;
}

export async function fetchMenuItemById(id) {
  return databases.getDocument(
    APPWRITE_CONFIG.databaseId,
    APPWRITE_CONFIG.menuCollectionId,
    id,
  );
}

export async function createMenuItem(data) {
  return databases.createDocument(
    APPWRITE_CONFIG.databaseId,
    APPWRITE_CONFIG.menuCollectionId,
    ID.unique(),
    data,
  );
}

export async function updateMenuItem(id, data) {
  return databases.updateDocument(
    APPWRITE_CONFIG.databaseId,
    APPWRITE_CONFIG.menuCollectionId,
    id,
    data,
  );
}

export async function deleteMenuItem(id) {
  return databases.deleteDocument(
    APPWRITE_CONFIG.databaseId,
    APPWRITE_CONFIG.menuCollectionId,
    id,
  );
}

