import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from 'firebase/firestore'

import { db } from '../firebase/config'
import type {
  Publication,
  PublicationInput,
} from '../types/publication'

const PUBLICATIONS_COLLECTION = 'publications'

const mapPublication = (
  id: string,
  data: PublicationInput & { createdAt?: Timestamp | null },
): Publication => ({
  id,
  title: data.title,
  description: data.description,
  content: data.content,
  createdAt: data.createdAt
    ? data.createdAt.toDate().toISOString()
    : new Date().toISOString(),
})

export const listenToPublications = (
  callback: (publications: Publication[]) => void,
  onError?: (error: Error) => void,
) => {
  const publicationsQuery = query(
    collection(db, PUBLICATIONS_COLLECTION),
    orderBy('createdAt', 'desc'),
  )

  return onSnapshot(
    publicationsQuery,
    (snapshot) => {
      const publications = snapshot.docs.map((document) =>
        mapPublication(document.id, document.data() as PublicationInput & { createdAt?: Timestamp | null }),
      )

      callback(publications)
    },
    (error) => {
      onError?.(error)
    },
  )
}

export const createPublication = async (input: PublicationInput): Promise<void> => {
  await addDoc(collection(db, PUBLICATIONS_COLLECTION), {
    ...input,
    createdAt: serverTimestamp(),
  })
}

export const deletePublication = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, PUBLICATIONS_COLLECTION, id))
}

export const getPublication = async (id: string): Promise<Publication | null> => {
  const document = await getDoc(doc(db, PUBLICATIONS_COLLECTION, id))
  
  if (!document.exists()) {
    return null
  }

  return mapPublication(document.id, document.data() as PublicationInput & { createdAt?: Timestamp | null })
}

export const updatePublication = async (id: string, input: PublicationInput): Promise<void> => {
  await updateDoc(doc(db, PUBLICATIONS_COLLECTION, id), {
    ...input,
  })
}

