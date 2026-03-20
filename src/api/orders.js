import { ID, Query } from 'appwrite';
import { databases, APPWRITE_CONFIG } from '../appwriteClient';

export async function createOrder(data) {
  const docId = ID.unique();
  const normalized =
    typeof data?.items === 'string'
      ? data
      : {
          ...data,
          // Support schemas where "items" is a varchar/text column (not JSON).
          // If your Appwrite column type is JSON, change it to JSON and this will still work
          // because Appwrite accepts JSON-string columns as text.
          items: JSON.stringify(data?.items ?? []),
        };
  return databases.createDocument(
    APPWRITE_CONFIG.databaseId,
    APPWRITE_CONFIG.ordersCollectionId,
    docId,
    {
      // Some schemas require a separate orderId column
      orderId: docId,
      ...normalized,
    },
  );
}

export async function fetchUserOrders(userId) {
  const res = await databases.listDocuments(
    APPWRITE_CONFIG.databaseId,
    APPWRITE_CONFIG.ordersCollectionId,
    [Query.equal('userId', userId)],
  );
  return res.documents;
}

export async function fetchAllOrders() {
  const res = await databases.listDocuments(
    APPWRITE_CONFIG.databaseId,
    APPWRITE_CONFIG.ordersCollectionId,
  );
  return res.documents;
}

export async function updateOrderStatus(id, status) {
  return databases.updateDocument(
    APPWRITE_CONFIG.databaseId,
    APPWRITE_CONFIG.ordersCollectionId,
    id,
    { status },
  );
}

