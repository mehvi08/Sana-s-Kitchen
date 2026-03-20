import { ID } from 'appwrite';
import { storage, APPWRITE_CONFIG } from '../appwriteClient';

export async function uploadMenuImage(file) {
  const created = await storage.createFile(
    APPWRITE_CONFIG.menuImagesBucketId,
    ID.unique(),
    file,
  );
  return created.$id;
}

export function getMenuImageUrl(fileId) {
  return storage.getFileView(APPWRITE_CONFIG.menuImagesBucketId, fileId).toString();
}

