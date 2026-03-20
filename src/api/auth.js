import { ID } from 'appwrite';
import { account, databases, APPWRITE_CONFIG } from '../appwriteClient';

async function ensureLoggedOut() {
  try {
    await account.deleteSessions();
  } catch {
    // no active session
  }
}

export async function signup({ name, email, password, phone, address }) {
  await ensureLoggedOut();
  // Create auth user
  await account.create(ID.unique(), email, password, name);
  const session = await account.createEmailPasswordSession(email, password);

  // Create profile document
  await databases.createDocument(
    APPWRITE_CONFIG.databaseId,
    APPWRITE_CONFIG.profilesCollectionId,
    ID.unique(),
    {
      userId: session.userId ?? session.user.$id,
      // Match Appwrite column key: "fullname"
      fullname: name,
      mobile: phone,
      address,
    },
  );

  return session;
}

export async function login({ email, password }) {
  await ensureLoggedOut();
  await account.createEmailPasswordSession(email, password);
  return account.get();
}

export async function logout() {
  return account.deleteSessions();
}

