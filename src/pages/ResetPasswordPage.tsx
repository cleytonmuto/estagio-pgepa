import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { resetPassword } from '../services/candidateService';
import {
    markTokenAsUsed,
    validatePasswordResetToken,
} from '../services/passwordResetService';
import { validatePassword } from '../utils/password';

export const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState<{
        password?: string;
        confirmPassword?: string;
        general?: string;
    }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isValidToken, setIsValidToken] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [tokenError, setTokenError] = useState<string | null>(null);

    useEffect(() => {
        const validateToken = async () => {
            if (!token) {
                setTokenError('Token não fornecido.');
                setIsLoading(false);
                return;
            }

            try {
                const validation = await validatePasswordResetToken(token);
                if (validation.valid) {
                    setIsValidToken(true);
                } else {
                    setTokenError(validation.error || 'Token inválido.');
                }
            } catch (error) {
                setTokenError(
                    error instanceof Error
                        ? error.message
                        : 'Erro ao validar token.',
                );
            } finally {
                setIsLoading(false);
            }
        };

        void validateToken();
    }, [token]);

    const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
        setPassword(event.currentTarget.value);
        setErrors((previous) => ({
            ...previous,
            password: undefined,
            confirmPassword: undefined,
            general: undefined,
        }));
    };

    const handleConfirmPasswordChange = (
        event: ChangeEvent<HTMLInputElement>,
    ) => {
        setConfirmPassword(event.currentTarget.value);
        setErrors((previous) => ({
            ...previous,
            confirmPassword: undefined,
            general: undefined,
        }));
    };

    const validate = (): boolean => {
        const nextErrors: typeof errors = {};

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            nextErrors.password = passwordValidation.errors[0];
        }

        if (password !== confirmPassword) {
            nextErrors.confirmPassword = 'As senhas precisam coincidir.';
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!token) {
            setErrors({ general: 'Token não fornecido.' });
            return;
        }

        if (!validate()) {
            return;
        }

        try {
            setIsSubmitting(true);
            setErrors({});

            // Validate token again before resetting
            const validation = await validatePasswordResetToken(token);
            if (!validation.valid || !validation.cpf) {
                setErrors({
                    general: validation.error || 'Token inválido ou expirado.',
                });
                return;
            }

            // Reset password
            await resetPassword(validation.cpf, password);

            // Mark token as used
            await markTokenAsUsed(token);

            setIsSuccess(true);
        } catch (error) {
            setErrors({
                general:
                    error instanceof Error
                        ? error.message
                        : 'Não foi possível redefinir a senha. Tente novamente.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <main className="auth-container">
                <section className="auth-card">
                    <header className="auth-header">
                        <h1>Redefinir Senha</h1>
                        <p>Validando token...</p>
                    </header>
                </section>
            </main>
        );
    }

    if (tokenError || !isValidToken) {
        return (
            <main className="auth-container">
                <section className="auth-card">
                    <header className="auth-header">
                        <h1>Token Inválido</h1>
                        <p className="form-error">
                            {tokenError ||
                                'O link de recuperação é inválido ou expirou.'}
                        </p>
                    </header>
                    <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                        <p style={{ marginBottom: '1.5rem', color: '#475569' }}>
                            Solicite um novo link de recuperação de senha.
                        </p>
                        <Link to="/forgot-password" className="primary-button">
                            Solicitar novo link
                        </Link>
                        <p
                            className="auth-helper"
                            style={{ marginTop: '1rem', textAlign: 'center' }}
                        >
                            <Link to="/login" className="link-button">
                                Voltar ao login
                            </Link>
                        </p>
                    </div>
                </section>
            </main>
        );
    }

    if (isSuccess) {
        return (
            <main className="auth-container">
                <section className="auth-card">
                    <header className="auth-header">
                        <h1>Senha Redefinida!</h1>
                        <p>Sua senha foi redefinida com sucesso.</p>
                    </header>
                    <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                        <p style={{ marginBottom: '1.5rem', color: '#475569' }}>
                            Agora você pode fazer login com sua nova senha.
                        </p>
                        <Link to="/login" className="primary-button">
                            Ir para o login
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
                    <h1>Redefinir Senha</h1>
                    <p>Crie uma nova senha para sua conta.</p>
                </header>

                <form className="auth-form" onSubmit={handleSubmit} noValidate>
                    {errors.general ? (
                        <p className="form-error">{errors.general}</p>
                    ) : null}

                    <label className="form-field">
                        <span>Nova senha</span>
                        <input
                            type="password"
                            value={password}
                            onChange={handlePasswordChange}
                            placeholder="Mínimo 8 caracteres: 1 maiúscula, 1 minúscula, 1 número, 1 símbolo"
                            required
                        />
                        {errors.password ? (
                            <span className="field-error">
                                {errors.password}
                            </span>
                        ) : (
                            <span
                                className="auth-helper"
                                style={{
                                    fontSize: '0.85rem',
                                    marginTop: '0.25rem',
                                }}
                            >
                                A senha deve ter pelo menos 8 caracteres,
                                incluindo 1 letra maiúscula, 1 minúscula, 1
                                número e 1 símbolo especial.
                            </span>
                        )}
                    </label>

                    <label className="form-field">
                        <span>Confirmar nova senha</span>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={handleConfirmPasswordChange}
                            placeholder="Digite a senha novamente"
                            required
                        />
                        {errors.confirmPassword ? (
                            <span className="field-error">
                                {errors.confirmPassword}
                            </span>
                        ) : null}
                    </label>

                    <button
                        type="submit"
                        className="primary-button"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Redefinindo...' : 'Redefinir senha'}
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

