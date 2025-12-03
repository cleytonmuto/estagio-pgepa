import { useState } from 'react'
import type { ChangeEvent, FormEvent, KeyboardEvent } from 'react'
import { Link } from 'react-router-dom'

import { authenticateCandidate } from '../services/candidateService'
import type { CandidateProfile } from '../types/candidate'
import { cleanCpf, isValidCpf } from '../utils/cpf'

interface LoginFormProps {
  onAuthenticated: (candidate: CandidateProfile) => void
  onSwitchToSignUp: () => void
}

interface LoginFormState {
  cpf: string
  password: string
}

interface LoginFormErrors {
  cpf?: string
  password?: string
  general?: string
}

const initialState: LoginFormState = { cpf: '', password: '' }

const getCpfError = (cpf: string): string | undefined => {
  if (!cpf) {
    return 'Informe o CPF.'
  }

  if (cpf.length !== 11) {
    return 'CPF deve conter 11 dígitos.'
  }

  if (!isValidCpf(cpf)) {
    return 'Informe um CPF válido.'
  }

  return undefined
}

export const LoginForm = ({
  onAuthenticated,
  onSwitchToSignUp,
}: LoginFormProps) => {
  const [form, setForm] = useState<LoginFormState>(initialState)
  const [errors, setErrors] = useState<LoginFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange =
    (field: keyof LoginFormState) => (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.currentTarget.value
      setForm((previous) => ({
        ...previous,
        [field]: field === 'cpf' ? cleanCpf(value).slice(0, 11) : value,
      }))
      setErrors((previous) => ({ ...previous, [field]: undefined, general: undefined }))
    }

  const handleBlockEnterKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      event.stopPropagation()
    }
  }

  const handleBlur = (field: keyof LoginFormState) => () => {
    if (field !== 'cpf') {
      return
    }

    const cpfError = getCpfError(form.cpf)
    setErrors((previous) => ({ ...previous, cpf: cpfError }))
  }

  const validate = (): boolean => {
    const nextErrors: LoginFormErrors = {}

    const cpfError = getCpfError(form.cpf)

    if (cpfError) {
      nextErrors.cpf = cpfError
    }

    if (!form.password) {
      nextErrors.password = 'Informe sua senha.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!validate()) {
      return
    }

    try {
      setIsSubmitting(true)
      const candidate = await authenticateCandidate(form.cpf, form.password)
      onAuthenticated(candidate)
    } catch (error) {
      setErrors({
        general:
          error instanceof Error
            ? error.message
            : 'Não foi possível entrar. Tente novamente.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <h2>Acesso ao Painel</h2>
      {errors.general ? <p className="form-error">{errors.general}</p> : null}
      <label className="form-field">
        <span>CPF</span>
        <input
          type="text"
          inputMode="numeric"
          maxLength={11}
          value={form.cpf}
          onChange={handleChange('cpf')}
          onBlur={handleBlur('cpf')}
          onKeyDown={handleBlockEnterKey}
          placeholder="Apenas números"
          required
        />
        {errors.cpf ? <span className="field-error">{errors.cpf}</span> : null}
      </label>

      <label className="form-field">
        <span>Senha</span>
        <input
          type="password"
          value={form.password}
          onChange={handleChange('password')}
          onKeyDown={handleBlockEnterKey}
          placeholder="Informe sua senha"
          required
        />
        {errors.password ? (
          <span className="field-error">{errors.password}</span>
        ) : null}
      </label>

      <button type="submit" className="primary-button" disabled={isSubmitting}>
        {isSubmitting ? 'Entrando...' : 'Entrar'}
      </button>

      <p className="auth-helper" style={{ textAlign: 'center' }}>
        <Link to="/forgot-password" className="link-button">
          Esqueci minha senha
        </Link>
      </p>
      <p className="auth-helper">
        Ainda não possui acesso?{' '}
        <button
          type="button"
          className="link-button"
          onClick={onSwitchToSignUp}
          disabled={isSubmitting}
        >
          Cadastre-se
        </button>
      </p>
    </form>
  )
}

