import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { LoginForm } from '../components/LoginForm'
import { SignUpForm } from '../components/SignUpForm'
import type { CandidateProfile } from '../types/candidate'

type AuthMode = 'login' | 'signUp'

interface AuthPageProps {
  onAuthenticated: (candidate: CandidateProfile) => void
}

export const AuthPage = ({ onAuthenticated }: AuthPageProps) => {
  const [mode, setMode] = useState<AuthMode>('login')
  const navigate = useNavigate()

  const handleAuthenticated = (candidate: CandidateProfile) => {
    onAuthenticated(candidate)
    const targetPath = candidate.role === 'administrator' ? '/admin/dashboard' : '/dashboard'
    navigate(targetPath, { replace: true })
  }

  return (
    <main className="auth-container">
      <section className="auth-card">
        <header className="auth-header">
          <h1>Programa de Estágio PGE-PA</h1>
          <p>Acesse seu painel ou realize o cadastro para participar da seleção.</p>
        </header>

        {mode === 'login' ? (
          <LoginForm
            onAuthenticated={handleAuthenticated}
            onSwitchToSignUp={() => setMode('signUp')}
          />
        ) : (
          <SignUpForm
            onRegistered={handleAuthenticated}
            onSwitchToLogin={() => setMode('login')}
          />
        )}
      </section>
    </main>
  )
}

