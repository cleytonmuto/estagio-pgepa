import { useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent, KeyboardEvent } from 'react';

import { registerCandidate } from '../services/candidateService';
import type {
    CandidateProfile,
    CandidateRegistrationInput,
    InternshipArea,
    InternshipCity,
    StudyPeriod,
} from '../types/candidate';
import { cleanCpf, isValidCpf } from '../utils/cpf';
import { isValidEmail } from '../utils/email';
import { validatePassword } from '../utils/password';

interface SignUpFormProps {
    onRegistered: (candidate: CandidateProfile) => void;
    onSwitchToLogin: () => void;
}

type SignUpFormState = CandidateRegistrationInput & {
    confirmPassword: string;
};

type SignUpErrors = Partial<Record<keyof SignUpFormState, string>> & {
    general?: string;
};

const periodOptions: Array<{ value: StudyPeriod; label: string }> = [
    { value: 'morning', label: 'Manhã' },
    { value: 'afternoon', label: 'Tarde' },
    { value: 'night', label: 'Noite' },
];

const areaOptions: Array<{ value: InternshipArea; label: string }> = [
    { value: 'administration', label: 'Administração' },
    { value: 'biblioteconomy', label: 'Biblioteconomia' },
    { value: 'contability', label: 'Contabilidade' },
    { value: 'law', label: 'Direito' },
    { value: 'computers', label: 'Informática' },
];

const cityOptions: Array<{ value: InternshipCity; label: string }> = [
    { value: 'Belém', label: 'Belém' },
    { value: 'Marabá', label: 'Marabá' },
    { value: 'Santarém', label: 'Santarém' },
];

const universityOptions = [
    'CESUPA',
    'Cosmopolita',
    'ESAMAC',
    'ESAMAZ',
    'Estácio',
    'Estratego',
    'FAAM',
    'FABEL',
    'FACBEL',
    'Faci Wyden',
    'FAPAN',
    'FAPEN',
    'FATEBE',
    'FCC',
    'FEAPA',
    'FIAMA',
    'FIBRA',
    'FINAMA',
    'IFPA',
    'UEPA',
    'UFOPA',
    'UFPA',
    'UFRA',
    'UNAMA',
    'UNIESAMAZ',
    'UNIFAMAZ',
    'UNIFESSPA',
    'UNINASSAU',
    'Outra não listada',
] as const;

const initialState: SignUpFormState = {
    fullName: '',
    cpf: '',
    rg: '',
    dateOfBirth: '',
    motherName: '',
    address: '',
    phoneNumber: '',
    email: '',
    university: '',
    course: '',
    semester: 1,
    period: 'morning',
    chosenArea: 'administration',
    chosenCity: 'Belém',
    afroDescendant: false,
    needsSpecialAssistance: false,
    password: '',
    confirmPassword: '',
};

const getCpfError = (cpf: string): string | undefined => {
    if (!cpf) {
        return 'Informe o CPF.';
    }

    if (cpf.length !== 11) {
        return 'CPF deve ter 11 dígitos.';
    }

    if (!isValidCpf(cpf)) {
        return 'CPF inválido.';
    }

    return undefined;
};

const getEmailError = (email: string): string | undefined => {
    if (!email) {
        return 'Informe o e-mail.';
    }

    if (!isValidEmail(email)) {
        return 'Informe um e-mail válido.';
    }

    return undefined;
};

/**
 * Normalizes text by:
 * - Replacing line breaks with spaces
 * - Collapsing multiple spaces into single spaces
 * - Trimming leading and trailing whitespace
 */
const normalizeText = (text: string): string => {
    return text
        .replace(/\r\n/g, ' ')
        .replace(/\n/g, ' ')
        .replace(/\r/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
};

export const SignUpForm = ({
    onRegistered,
    onSwitchToLogin,
}: SignUpFormProps) => {
    const [form, setForm] = useState<SignUpFormState>(initialState);
    const [errors, setErrors] = useState<SignUpErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const semesterOptions = useMemo(
        () => Array.from({ length: 10 }, (_, index) => index + 1),
        []
    );

    const handleInputChange =
        (field: keyof SignUpFormState) =>
        (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            const target = event.target;
            const nextValue =
                target instanceof HTMLInputElement && target.type === 'checkbox'
                    ? target.checked
                    : target.value;

            setForm((previous) => {
                // Numeric-only fields
                if (field === 'cpf') {
                    return {
                        ...previous,
                        cpf: cleanCpf(String(nextValue)).slice(0, 11),
                    };
                }

                if (field === 'rg') {
                    const numericOnly = String(nextValue).replace(/\D/g, '');
                    return {
                        ...previous,
                        rg: numericOnly,
                    };
                }

                if (field === 'phoneNumber') {
                    const numericOnly = String(nextValue).replace(/\D/g, '');
                    return {
                        ...previous,
                        phoneNumber: numericOnly,
                    };
                }

                if (field === 'semester') {
                    return {
                        ...previous,
                        semester: Number(nextValue),
                    };
                }

                // Password fields - keep as is (spaces might be intentional)
                if (field === 'password' || field === 'confirmPassword') {
                    return {
                        ...previous,
                        [field]: String(nextValue),
                    };
                }

                // Boolean fields
                if (
                    field === 'afroDescendant' ||
                    field === 'needsSpecialAssistance'
                ) {
                    return {
                        ...previous,
                        [field]: nextValue,
                    };
                }

                // All other text fields - normalize (trim and collapse spaces)
                const normalizedValue = normalizeText(String(nextValue));
                return {
                    ...previous,
                    [field]: normalizedValue,
                };
            });

            setErrors((previous) => ({
                ...previous,
                [field]: undefined,
                general: undefined,
            }));
        };

    const handleBlockEnterKey = (
        event: KeyboardEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            event.stopPropagation();
        }
    };

    const handleBlur = (field: keyof SignUpFormState) => () => {
        if (field === 'cpf') {
            const cpfError = getCpfError(form.cpf);
            setErrors((previous) => ({ ...previous, cpf: cpfError }));
            return;
        }

        if (field === 'email') {
            const emailError = getEmailError(form.email);
            setErrors((previous) => ({ ...previous, email: emailError }));
        }
    };

    const validate = (): boolean => {
        const nextErrors: SignUpErrors = {};

        if (!form.fullName) {
            nextErrors.fullName = 'Informe o nome completo.';
        }

        const cpfError = getCpfError(form.cpf);

        if (cpfError) {
            nextErrors.cpf = cpfError;
        }

        const emailError = getEmailError(form.email);

        if (emailError) {
            nextErrors.email = emailError;
        }

        if (!form.motherName) {
            nextErrors.motherName = 'Informe o nome da mãe.';
        }

        if (!form.dateOfBirth) {
            nextErrors.dateOfBirth = 'Informe a data de nascimento.';
        } else {
            const dateValue = new Date(form.dateOfBirth);
            if (Number.isNaN(dateValue.getTime())) {
                nextErrors.dateOfBirth = 'Informe uma data válida.';
            }
        }

        if (!form.rg) {
            nextErrors.rg = 'Informe o RG.';
        }

        if (!form.address) {
            nextErrors.address = 'Informe o endereço.';
        }

        if (!form.phoneNumber) {
            nextErrors.phoneNumber = 'Informe um telefone.';
        }

        if (!form.university) {
            nextErrors.university = 'Informe a universidade.';
        }

        if (!form.course) {
            nextErrors.course = 'Informe o curso.';
        }

        if (
            Number.isNaN(form.semester) ||
            form.semester < 1 ||
            form.semester > 10
        ) {
            nextErrors.semester = 'O semestre deve estar entre 1 e 10.';
        }

        const passwordValidation = validatePassword(form.password);
        if (!passwordValidation.isValid) {
            nextErrors.password = passwordValidation.errors[0];
        }

        if (form.password !== form.confirmPassword) {
            nextErrors.confirmPassword = 'As senhas precisam coincidir.';
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
            const { confirmPassword, ...candidatePayload } = form;
            void confirmPassword;

            // Normalize text fields before submission
            const normalizedPayload = {
                ...candidatePayload,
                fullName: normalizeText(candidatePayload.fullName),
                motherName: normalizeText(candidatePayload.motherName),
                address: normalizeText(candidatePayload.address),
                course: normalizeText(candidatePayload.course),
                email: normalizeText(candidatePayload.email),
                cpf: form.cpf,
            };

            const candidate = await registerCandidate(normalizedPayload);

            onRegistered(candidate);
            setForm(initialState);
            setErrors({});
        } catch (error) {
            if (
                error instanceof Error &&
                error.message.toLowerCase().includes('cpf already registered')
            ) {
                setErrors({
                    cpf: 'Este CPF já possui inscrição ativa.',
                });
            } else {
                setErrors({
                    general:
                        error instanceof Error
                            ? error.message
                            : 'Não foi possível concluir o cadastro. Tente novamente.',
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <h2>Cadastro de Candidato</h2>
            {errors.general ? (
                <p className="form-error">{errors.general}</p>
            ) : null}

            <div className="form-grid">
                <label className="form-field">
                    <span>Nome completo</span>
                    <input
                        type="text"
                        value={form.fullName}
                        onChange={handleInputChange('fullName')}
                        onKeyDown={handleBlockEnterKey}
                        required
                    />
                    {errors.fullName ? (
                        <span className="field-error">{errors.fullName}</span>
                    ) : null}
                </label>

                <label className="form-field">
                    <span>CPF</span>
                    <input
                        type="text"
                        inputMode="numeric"
                        maxLength={11}
                        value={form.cpf}
                        onChange={handleInputChange('cpf')}
                        onBlur={handleBlur('cpf')}
                        onKeyDown={handleBlockEnterKey}
                        placeholder="Apenas números"
                        required
                    />
                    {errors.cpf ? (
                        <span className="field-error">{errors.cpf}</span>
                    ) : null}
                </label>

                <label className="form-field">
                    <span>RG</span>
                    <input
                        type="text"
                        inputMode="numeric"
                        value={form.rg}
                        onChange={handleInputChange('rg')}
                        maxLength={14}
                        onKeyDown={handleBlockEnterKey}
                        required
                    />
                    {errors.rg ? (
                        <span className="field-error">{errors.rg}</span>
                    ) : null}
                </label>

                <label className="form-field">
                    <span>Data de nascimento</span>
                    <input
                        type="date"
                        value={form.dateOfBirth}
                        onChange={handleInputChange('dateOfBirth')}
                        required
                    />
                    {errors.dateOfBirth ? (
                        <span className="field-error">
                            {errors.dateOfBirth}
                        </span>
                    ) : null}
                </label>

                <label className="form-field">
                    <span>Nome da mãe</span>
                    <input
                        type="text"
                        value={form.motherName}
                        onChange={handleInputChange('motherName')}
                        onKeyDown={handleBlockEnterKey}
                        required
                    />
                    {errors.motherName ? (
                        <span className="field-error">{errors.motherName}</span>
                    ) : null}
                </label>

                <label className="form-field">
                    <span>Endereço</span>
                    <input
                        type="text"
                        value={form.address}
                        onChange={handleInputChange('address')}
                        onKeyDown={handleBlockEnterKey}
                        required
                    />
                    {errors.address ? (
                        <span className="field-error">{errors.address}</span>
                    ) : null}
                </label>

                <label className="form-field">
                    <span>Telefone</span>
                    <input
                        type="tel"
                        inputMode="numeric"
                        value={form.phoneNumber}
                        onChange={handleInputChange('phoneNumber')}
                        onKeyDown={handleBlockEnterKey}
                        placeholder="(xx) xxxxx-xxxx"
                        required
                    />
                    {errors.phoneNumber ? (
                        <span className="field-error">
                            {errors.phoneNumber}
                        </span>
                    ) : null}
                </label>

                <label className="form-field">
                    <span>E-mail</span>
                    <input
                        type="email"
                        value={form.email}
                        onChange={handleInputChange('email')}
                        onBlur={handleBlur('email')}
                        onKeyDown={handleBlockEnterKey}
                        required
                    />
                    {errors.email ? (
                        <span className="field-error">{errors.email}</span>
                    ) : null}
                </label>

                <label className="form-field">
                    <span>Instituição de Ensino Superior</span>
                    <select
                        value={form.university}
                        onChange={handleInputChange('university')}
                        onKeyDown={handleBlockEnterKey}
                        required
                    >
                        <option value="" disabled>
                            Selecione a universidade
                        </option>
                        {universityOptions.map((name) => (
                            <option key={name} value={name}>
                                {name}
                            </option>
                        ))}
                    </select>
                    {errors.university ? (
                        <span className="field-error">{errors.university}</span>
                    ) : null}
                </label>

                <label className="form-field">
                    <span>Curso</span>
                    <input
                        type="text"
                        value={form.course}
                        onChange={handleInputChange('course')}
                        onKeyDown={handleBlockEnterKey}
                        required
                    />
                    {errors.course ? (
                        <span className="field-error">{errors.course}</span>
                    ) : null}
                </label>

                <label className="form-field">
                    <span>Semestre</span>
                    <select
                        value={form.semester}
                        onChange={handleInputChange('semester')}
                        onKeyDown={handleBlockEnterKey}
                        required
                    >
                        {semesterOptions.map((semester) => (
                            <option key={semester} value={semester}>
                                {semester}
                            </option>
                        ))}
                    </select>
                    {errors.semester ? (
                        <span className="field-error">{errors.semester}</span>
                    ) : null}
                </label>

                <label className="form-field">
                    <span>Turno</span>
                    <select
                        value={form.period}
                        onChange={handleInputChange('period')}
                        onKeyDown={handleBlockEnterKey}
                        required
                    >
                        {periodOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="form-field">
                    <span>Área desejada</span>
                    <select
                        value={form.chosenArea}
                        onChange={handleInputChange('chosenArea')}
                        onKeyDown={handleBlockEnterKey}
                        required
                    >
                        {areaOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="form-field">
                    <span>Município desejado</span>
                    <select
                        value={form.chosenCity}
                        onChange={handleInputChange('chosenCity')}
                        onKeyDown={handleBlockEnterKey}
                        required
                    >
                        {cityOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="form-field checkbox-field">
                    <input
                        type="checkbox"
                        checked={form.afroDescendant}
                        onChange={handleInputChange('afroDescendant')}
                    />
                    <span>
                        Candidato(a) autodeclara-se negro(a), conforme quesito
                        de cor ou raça utilizado pelo IBGE:
                    </span>
                </label>

                <label className="form-field checkbox-field">
                    <input
                        type="checkbox"
                        checked={form.needsSpecialAssistance}
                        onChange={handleInputChange('needsSpecialAssistance')}
                    />
                    <span>
                        O candidato é pessoa com deficiência, segundo os
                        critérios da Lei 13.145/2015
                    </span>
                </label>

                <label className="form-field">
                    <span>Senha</span>
                    <input
                        type="password"
                        value={form.password}
                        onChange={handleInputChange('password')}
                        onKeyDown={handleBlockEnterKey}
                        onBlur={() => {
                            if (form.password) {
                                const passwordValidation = validatePassword(
                                    form.password
                                );
                                if (!passwordValidation.isValid) {
                                    setErrors((previous) => ({
                                        ...previous,
                                        password: passwordValidation.errors[0],
                                    }));
                                } else {
                                    setErrors((previous) => ({
                                        ...previous,
                                        password: undefined,
                                    }));
                                }
                            }
                        }}
                        placeholder="Mínimo 8 caracteres: 1 maiúscula, 1 minúscula, 1 número, 1 símbolo"
                        required
                    />
                    {errors.password ? (
                        <span className="field-error">{errors.password}</span>
                    ) : (
                        <span
                            className="auth-helper"
                            style={{
                                fontSize: '0.85rem',
                                marginTop: '0.25rem',
                            }}
                        >
                            A senha deve ter pelo menos 8 caracteres, incluindo
                            1 letra maiúscula, 1 minúscula, 1 número e 1 símbolo
                            especial.
                        </span>
                    )}
                </label>

                <label className="form-field">
                    <span>Confirmar senha</span>
                    <input
                        type="password"
                        value={form.confirmPassword}
                        onChange={handleInputChange('confirmPassword')}
                        onKeyDown={handleBlockEnterKey}
                        required
                    />
                    {errors.confirmPassword ? (
                        <span className="field-error">
                            {errors.confirmPassword}
                        </span>
                    ) : null}
                </label>
            </div>

            <button
                type="submit"
                className="primary-button"
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Cadastrando...' : 'Concluir cadastro'}
            </button>

            <p className="auth-helper">
                Já possui cadastro?{' '}
                <button
                    type="button"
                    className="link-button"
                    onClick={onSwitchToLogin}
                    disabled={isSubmitting}
                >
                    Entrar
                </button>
            </p>
        </form>
    );
};
