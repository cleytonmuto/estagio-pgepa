import { hashSync, compareSync } from 'bcryptjs'
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from 'firebase/firestore'

import { db } from '../firebase/config'
import type {
  CandidateProfile,
  CandidateRecord,
  CandidateRegistrationInput,
  InternshipArea,
  InternshipCity,
  StudyPeriod,
} from '../types/candidate'
import { cleanCpf, isValidCpf } from '../utils/cpf'

const CANDIDATES_COLLECTION = 'candidates'
const PASSWORD_SALT_ROUNDS = 10

const toCandidateProfile = (
  id: string,
  record: CandidateRecord,
): CandidateProfile => ({
  id,
  fullName: record.fullName,
  cpf: record.cpf,
  rg: record.rg,
  dateOfBirth: record.dateOfBirth,
  motherName: record.motherName,
  address: record.address,
  phoneNumber: record.phoneNumber,
  email: record.email,
  university: record.university,
  course: record.course,
  semester: record.semester,
  period: record.period,
  chosenArea: record.chosenArea,
  chosenCity: record.chosenCity,
  afroDescendant: record.afroDescendant,
  needsSpecialAssistance: record.needsSpecialAssistance,
  deliveredFood: record.deliveredFood ?? false,
  role: record.role,
})

export const registerCandidate = async (
  input: CandidateRegistrationInput,
): Promise<CandidateProfile> => {
  const normalizedCpf = cleanCpf(input.cpf)

  if (!isValidCpf(normalizedCpf)) {
    throw new Error('CPF inválido.')
  }

  const candidateRef = doc(db, CANDIDATES_COLLECTION, normalizedCpf)
  const existingCandidate = await getDoc(candidateRef)

  if (existingCandidate.exists()) {
    throw new Error('CPF already registered.')
  }

  const { password, ...candidateData } = input
  const passwordHash = hashSync(password, PASSWORD_SALT_ROUNDS)
  const timestamp = new Date().toISOString()

  const record: CandidateRecord = {
    ...candidateData,
    cpf: normalizedCpf,
    role: 'candidate',
    passwordHash,
    deliveredFood: false, // Always false for new registrations
    createdAt: timestamp,
    updatedAt: timestamp,
  }

  await setDoc(candidateRef, record)

  return toCandidateProfile(candidateRef.id, record)
}

export const checkCpfExists = async (cpf: string): Promise<boolean> => {
  const normalizedCpf = cleanCpf(cpf)
  const candidateRef = doc(db, CANDIDATES_COLLECTION, normalizedCpf)
  const snapshot = await getDoc(candidateRef)
  return snapshot.exists()
}

export const getCandidateByCpf = async (cpf: string): Promise<CandidateProfile | null> => {
  const normalizedCpf = cleanCpf(cpf)
  const candidateRef = doc(db, CANDIDATES_COLLECTION, normalizedCpf)
  const snapshot = await getDoc(candidateRef)

  if (!snapshot.exists()) {
    return null
  }

  const data = snapshot.data() as CandidateRecord
  return toCandidateProfile(snapshot.id, data)
}

export const authenticateCandidate = async (
  cpf: string,
  password: string,
): Promise<CandidateProfile> => {
  const normalizedCpf = cleanCpf(cpf)
  const candidateRef = doc(db, CANDIDATES_COLLECTION, normalizedCpf)
  const snapshot = await getDoc(candidateRef)

  if (!snapshot.exists()) {
    throw new Error('Candidate not found.')
  }

  const data = snapshot.data() as CandidateRecord

  const isPasswordValid = compareSync(password, data.passwordHash)

  if (!isPasswordValid) {
    throw new Error('Invalid credentials.')
  }

  return toCandidateProfile(snapshot.id, data)
}

export const fetchCandidates = async (): Promise<CandidateProfile[]> => {
  const snapshot = await getDocs(collection(db, CANDIDATES_COLLECTION))

  return snapshot.docs.map((docSnapshot) => {
    const data = docSnapshot.data() as CandidateRecord
    return toCandidateProfile(docSnapshot.id, data)
  })
}

export interface CandidateUpdateInput {
  fullName?: string
  rg?: string
  dateOfBirth?: string
  motherName?: string
  address?: string
  phoneNumber?: string
  email?: string
  university?: string
  course?: string
  semester?: number
  period?: StudyPeriod
  chosenArea?: InternshipArea
  chosenCity?: InternshipCity
  afroDescendant?: boolean
  needsSpecialAssistance?: boolean
  deliveredFood?: boolean
}

export const updateCandidate = async (
  cpf: string,
  input: CandidateUpdateInput,
): Promise<CandidateProfile> => {
  const normalizedCpf = cleanCpf(cpf)
  const candidateRef = doc(db, CANDIDATES_COLLECTION, normalizedCpf)
  const snapshot = await getDoc(candidateRef)

  if (!snapshot.exists()) {
    throw new Error('Candidato não encontrado.')
  }

  const updateData: Partial<CandidateRecord> = {
    ...input,
    updatedAt: new Date().toISOString(),
  }

  await updateDoc(candidateRef, updateData)

  const updatedSnapshot = await getDoc(candidateRef)
  const data = updatedSnapshot.data() as CandidateRecord
  return toCandidateProfile(updatedSnapshot.id, data)
}

export const deleteCandidate = async (cpf: string): Promise<void> => {
  const normalizedCpf = cleanCpf(cpf)
  const candidateRef = doc(db, CANDIDATES_COLLECTION, normalizedCpf)
  const snapshot = await getDoc(candidateRef)

  if (!snapshot.exists()) {
    throw new Error('Candidato não encontrado.')
  }

  await deleteDoc(candidateRef)
}

export const resetPassword = async (
  cpf: string,
  newPassword: string,
): Promise<void> => {
  const normalizedCpf = cleanCpf(cpf)
  const candidateRef = doc(db, CANDIDATES_COLLECTION, normalizedCpf)
  const snapshot = await getDoc(candidateRef)

  if (!snapshot.exists()) {
    throw new Error('Candidato não encontrado.')
  }

  const passwordHash = hashSync(newPassword, PASSWORD_SALT_ROUNDS)

  await updateDoc(candidateRef, {
    passwordHash,
    updatedAt: new Date().toISOString(),
  })
}

