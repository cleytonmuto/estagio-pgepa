import { ChangeEvent, FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';

import { getCandidateByCpf } from '../services/candidateService';
import {
    createPasswordResetToken,
} from '../services/passwordResetService';
import { sendPasswordResetEmail } from '../services/emailService';
import { cleanCpf, isValidCpf } from '../utils/cpf';
import { isValidEmail } from '../utils/email';

export const ForgotPasswordPage = () => {
    const [cpf, setCpf] = useState('');
    const [email, setEmail] = useState('');
    const [errors, setErrors] = useState<{
        cpf?: string;
        email?: string;
        general?: string;
    }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleCpfChange = (event: ChangeEvent<HTMLInputElement>) => {
        const value = cleanCpf(event.currentTarget.value).slice(0, 11);
        setCpf(value);
        setErrors((previous) => ({
            ...previous,
            cpf: undefined,
            general: undefined,
        }));
    };

    const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
        setEmail(event.currentTarget.value);
        setErrors((previous) => ({
            ...previous,
            email: undefined,
            general: undefined,
        }));
    };

    const validate = (): boolean => {
        const nextErrors: typeof errors = {};

        if (!cpf) {
            nextErrors.cpf = 'Informe o CPF.';
        } else if (cpf.length !== 11) {
            nextErrors.cpf = 'CPF deve ter 11 dígitos.';
        } else if (!isValidCpf(cpf)) {
            nextErrors.cpf = 'CPF inválido.';
        }

        if (!email) {
            nextErrors.email = 'Informe o e-mail.';
        } else if (!isValidEmail(email)) {
            nextErrors.email = 'Informe um e-mail válido.';
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!validate()) {
            return;
        }

        try {
            setIsSubmitting(true);
            setErrors({});

            // Verify that the CPF and email match
            const candidate = await getCandidateByCpf(cpf);

            if (!candidate) {
                setErrors({
                    general: 'CPF não encontrado no sistema.',
                });
                return;
            }

            if (candidate.email.toLowerCase() !== email.toLowerCase()) {
                setErrors({
                    general:
                        'O e-mail informado não corresponde ao CPF cadastrado.',
                });
                return;
            }

            // Create reset token
            const resetToken = await createPasswordResetToken(
                candidate.cpf,
                candidate.email,
            );

            // Send reset email
            await sendPasswordResetEmail(
                candidate.email,
                resetToken,
                candidate.fullName,
            );

            setIsSuccess(true);
        } catch (error) {
            setErrors({
                general:
                    error instanceof Error
                        ? error.message
                        : 'Não foi possível processar a solicitação. Tente novamente.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <main className="auth-container">
                <section className="auth-card">
                    <header className="auth-header">
                        <h1>E-mail enviado!</h1>
                        <p>
                            Enviamos um link de recuperação de senha para{' '}
                            <strong>{email}</strong>
                        </p>
                    </header>
                    <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                        <p style={{ marginBottom: '1.5rem', color: '#475569' }}>
                            Verifique sua caixa de entrada e siga as instruções
                            para redefinir sua senha.
                        </p>
                        <p
                            style={{
                                marginBottom: '1.5rem',
                                fontSize: '0.9rem',
                                color: '#64748b',
                            }}
                        >
                            O link é válido por 24 horas.
                        </p>
                        <Link to="/login" className="primary-button">
                            Voltar ao login
                        </Link>
                    </div>
                </section>
            </main>
        );
    }

    return (
        <main className="auth-container">
            <section className="auth-card">
                <header className="auth-header">
                    <h1>Recuperação de Senha</h1>
                    <p>
                        Informe seu CPF e e-mail cadastrado para receber um link
                        de recuperação.
                    </p>
                </header>

                <form className="auth-form" onSubmit={handleSubmit} noValidate>
                    {errors.general ? (
                        <p className="form-error">{errors.general}</p>
                    ) : null}

                    <label className="form-field">
                        <span>CPF</span>
                        <input
                            type="text"
                            inputMode="numeric"
                            maxLength={11}
                            value={cpf}
                            onChange={handleCpfChange}
                            placeholder="Apenas números"
                            required
                        />
                        {errors.cpf ? (
                            <span className="field-error">{errors.cpf}</span>
                        ) : null}
                    </label>

                    <label className="form-field">
                        <span>E-mail cadastrado</span>
                        <input
                            type="email"
                            value={email}
                            onChange={handleEmailChange}
                            placeholder="seu-email@exemplo.com"
                            required
                        />
                        {errors.email ? (
                            <span className="field-error">{errors.email}</span>
                        ) : null}
                    </label>

                    <button
                        type="submit"
                        className="primary-button"
                        disabled={isSubmitting}
                    >
                        {isSubmitting
                            ? 'Enviando...'
                            : 'Enviar link de recuperação'}
                    </button>

                    <p className="auth-helper" style={{ textAlign: 'center' }}>
                        <Link to="/login" className="link-button">
                            Voltar ao login
                        </Link>
                    </p>
                </form>
            </section>
        </main>
    );
};

