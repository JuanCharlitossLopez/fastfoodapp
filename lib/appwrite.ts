import { CreateUserParams, SignInParams, User } from "@/type"
import { Account, Avatars, Client, Databases, ID, Query } from "react-native-appwrite"

export const appwriteConfig = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
  platform: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_NAME!,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
  databaseId: '6967ea37000dc2550d6c',
  userCollectionId: 'user',
}

export const client = new Client()

client
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setPlatform(appwriteConfig.platform)

export const account = new Account(client)
export const databases = new Databases(client)
const avatars = new Avatars(client)

export const createUser = async ({ email, password, name }: CreateUserParams) => {
  try {
    const newAccount = await account.create(ID.unique(), email, password, name)

    if (!newAccount) throw Error

    await signIn({ email, password })

    const avatarURL = avatars.getInitialsURL(name)

    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email, name, avatar: avatarURL
      }
    )

    return newUser
  } catch (error) {
    throw new Error(error as string)
  }

}

export const signIn = async ({ email, password }: SignInParams) => {
  try {
    const session = await account.createEmailPasswordSession(email, password)

  } catch (error) {
    throw new Error(error as string)
  }
}

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const curretAccount = await account.get()
    if (!curretAccount)
      throw new Error

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal('accountId', curretAccount.$id)]
    )

    if (!currentUser)
      throw Error

    return currentUser.documents[0] as unknown as User
  } catch (error) {
    console.log({ error })
    throw new Error(error as string)
  }
}