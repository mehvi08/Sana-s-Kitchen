import { Query } from 'appwrite';
import { databases, APPWRITE_CONFIG } from '../appwriteClient';

export async function fetchProfileByUserId(userId) {
  const res = await databases.listDocuments(
    APPWRITE_CONFIG.databaseId,
    APPWRITE_CONFIG.profilesCollectionId,
    [Query.equal('userId', userId)],
  );
  return res.documents?.[0] || null;
}

export async function updateProfile(profileId, data) {
  return databases.updateDocument(
    APPWRITE_CONFIG.databaseId,
    APPWRITE_CONFIG.profilesCollectionId,
    profileId,
    data,
  );
}

