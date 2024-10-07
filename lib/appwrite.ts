import { Client, Account, Databases, Storage, Teams } from 'appwrite';

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID as string);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const teams = new Teams(client);

export const POSTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_POSTS_COLLECTION_ID as string;
export const COMMENTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COMMENTS_COLLECTION_ID as string;

export { client };