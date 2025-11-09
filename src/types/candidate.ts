export type StudyPeriod = 'morning' | 'afternoon' | 'night'

export type InternshipArea =
  | 'administration'
  | 'biblioteconomy'
  | 'contability'
  | 'law'
  | 'computers'

export type InternshipCity = 'Belém' | 'Marabá' | 'Santarém'

export type Department = 'Polícia Civil' | 'SSP'

export interface CandidateFormData {
  fullName: string
  cpf: string
  rg: string
  department: Department
  motherName: string
  address: string
  phoneNumber: string
  email: string
  university: string
  course: string
  semester: number
  period: StudyPeriod
  chosenArea: InternshipArea
  chosenCity: InternshipCity
  afroDescendant: boolean
  needsSpecialAssistance: boolean
}

export interface CandidateRecord extends CandidateFormData {
  passwordHash: string
  createdAt: string
  updatedAt: string
}

export interface CandidateProfile extends CandidateFormData {
  id: string
}

export interface CandidateRegistrationInput extends CandidateFormData {
  password: string
}

