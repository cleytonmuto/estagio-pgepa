import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore'

import { db } from '../firebase/config'

const SETTINGS_DOC_ID = 'app_settings'
const SETTINGS_COLLECTION = 'settings'

export interface AppSettings {
  allowCandidateEdit: boolean
}

const defaultSettings: AppSettings = {
  allowCandidateEdit: false,
}

export const getSettings = async (): Promise<AppSettings> => {
  const settingsDoc = await getDoc(
    doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID),
  )

  if (!settingsDoc.exists()) {
    // Create default settings if they don't exist
    await setDoc(doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID), defaultSettings)
    return defaultSettings
  }

  const data = settingsDoc.data() as AppSettings
  return {
    allowCandidateEdit: data.allowCandidateEdit ?? defaultSettings.allowCandidateEdit,
  }
}

export const updateSettings = async (settings: Partial<AppSettings>): Promise<void> => {
  const currentSettings = await getSettings()
  await setDoc(
    doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID),
    { ...currentSettings, ...settings },
    { merge: true },
  )
}

export const listenToSettings = (
  callback: (settings: AppSettings) => void,
  onError?: (error: Error) => void,
) => {
  return onSnapshot(
    doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID),
    (snapshot) => {
      if (!snapshot.exists()) {
        callback(defaultSettings)
        return
      }

      const data = snapshot.data() as AppSettings
      callback({
        allowCandidateEdit: data.allowCandidateEdit ?? defaultSettings.allowCandidateEdit,
      })
    },
    (error) => {
      onError?.(error)
    },
  )
}

