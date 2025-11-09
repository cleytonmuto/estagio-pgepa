import { hashSync, compareSync } from 'bcryptjs'
import { doc, getDoc, setDoc } from 'firebase/firestore'

import { db } from '../firebase/config'
import type {
  CandidateProfile,
  CandidateRecord,
  CandidateRegistrationInput,
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
  department: record.department,
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
    passwordHash,
    createdAt: timestamp,
    updatedAt: timestamp,
  }

  await setDoc(candidateRef, record)

  return toCandidateProfile(candidateRef.id, record)
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

