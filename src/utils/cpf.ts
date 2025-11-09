const CPF_LENGTH = 11

export const cleanCpf = (value: string): string => value.replace(/\D/g, '')

const isRepeatedSequence = (cpf: string): boolean =>
  /^(\d)\1{10}$/.test(cpf)

const calculateVerifierDigit = (cpf: string, factor: number): number => {
  let total = 0

  for (let i = 0; i < factor - 1; i += 1) {
    total += Number(cpf[i]) * (factor - i)
  }

  const remainder = (total * 10) % 11
  return remainder === 10 ? 0 : remainder
}

export const isValidCpf = (value: string): boolean => {
  const cpf = cleanCpf(value)

  if (cpf.length !== CPF_LENGTH) {
    return false
  }

  if (isRepeatedSequence(cpf)) {
    return false
  }

  const firstDigit = calculateVerifierDigit(cpf, 10)
  const secondDigit = calculateVerifierDigit(cpf, 11)

  return firstDigit === Number(cpf[9]) && secondDigit === Number(cpf[10])
}

export const formatCpf = (value: string): string => {
  const cpf = cleanCpf(value)

  if (cpf.length !== CPF_LENGTH) {
    return value
  }

  return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`
}

