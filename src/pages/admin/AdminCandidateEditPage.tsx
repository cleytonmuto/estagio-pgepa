import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { getCandidateByCpf, updateCandidate } from '../../services/candidateService';
import type {
    CandidateProfile,
    InternshipArea,
    InternshipCity,
    StudyPeriod,
} from '../../types/candidate';
import { normalizeText } from '../../utils/text';
import { isValidEmail } from '../../utils/email';

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

export const AdminCandidateEditPage = () => {
    const navigate = useNavigate();
    const { cpf } = useParams<{ cpf: string }>();
    const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
    const [form, setForm] = useState({
        fullName: '',
        rg: '',
        dateOfBirth: '',
        motherName: '',
        address: '',
        phoneNumber: '',
        email: '',
        university: '',
        course: '',
        semester: 1,
        period: 'morning' as StudyPeriod,
        chosenArea: 'administration' as InternshipArea,
        chosenCity: 'Belém' as InternshipCity,
        afroDescendant: false,
        needsSpecialAssistance: false,
        deliveredFood: false,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [generalError, setGeneralError] = useState<string | null>(null);

    useEffect(() => {
        const loadCandidate = async () => {
            if (!cpf) {
                setLoadError('CPF do candidato não fornecido.');
                setIsLoading(false);
                return;
            }

            try {
                const candidateData = await getCandidateByCpf(cpf);
                if (!candidateData) {
                    setLoadError('Candidato não encontrado.');
                    setIsLoading(false);
                    return;
                }

                setCandidate(candidateData);
                setForm({
                    fullName: candidateData.fullName,
                    rg: candidateData.rg,
                    dateOfBirth: candidateData.dateOfBirth,
                    motherName: candidateData.motherName,
                    address: candidateData.address,
                    phoneNumber: candidateData.phoneNumber,
                    email: candidateData.email,
                    university: candidateData.university,
                    course: candidateData.course,
                    semester: candidateData.semester,
                    period: candidateData.period,
                    chosenArea: candidateData.chosenArea,
                    chosenCity: candidateData.chosenCity,
                    afroDescendant: candidateData.afroDescendant,
                    needsSpecialAssistance: candidateData.needsSpecialAssistance,
                    deliveredFood: candidateData.deliveredFood,
                });
            } catch (error) {
                setLoadError(
                    error instanceof Error
                        ? error.message
                        : 'Não foi possível carregar os dados do candidato.',
                );
            } finally {
                setIsLoading(false);
            }
        };

        void loadCandidate();
    }, [cpf]);

    const handleChange =
        (field: keyof typeof form) =>
        (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            const target = event.target;
            const nextValue =
                target instanceof HTMLInputElement && target.type === 'checkbox'
                    ? target.checked
                    : target.value;

            setForm((previous) => {
                if (field === 'rg' || field === 'phoneNumber') {
                    const numericOnly = String(nextValue).replace(/\D/g, '');
                    return {
                        ...previous,
                        [field]: numericOnly,
                    };
                }

                if (field === 'semester') {
                    return {
                        ...previous,
                        semester: Number(nextValue),
                    };
                }

                if (
                    field === 'fullName' ||
                    field === 'motherName' ||
                    field === 'address' ||
                    field === 'course' ||
                    field === 'email'
                ) {
                    return {
                        ...previous,
                        [field]: normalizeText(String(nextValue)),
                    };
                }

                return {
                    ...previous,
                    [field]: nextValue,
                };
            });

            setErrors((previous) => ({
                ...previous,
                [field]: undefined,
            }));
            setGeneralError(null);
        };

    const validate = (): boolean => {
        const nextErrors: Record<string, string> = {};

        if (!form.fullName.trim()) {
            nextErrors.fullName = 'Informe o nome completo.';
        }

        if (!form.motherName.trim()) {
            nextErrors.motherName = 'Informe o nome da mãe.';
        }

        if (!form.dateOfBirth) {
            nextErrors.dateOfBirth = 'Informe a data de nascimento.';
        }

        if (!form.rg) {
            nextErrors.rg = 'Informe o RG.';
        }

        if (!form.address.trim()) {
            nextErrors.address = 'Informe o endereço.';
        }

        if (!form.phoneNumber) {
            nextErrors.phoneNumber = 'Informe um telefone.';
        }

        if (!form.email.trim()) {
            nextErrors.email = 'Informe o e-mail.';
        } else if (!isValidEmail(form.email)) {
            nextErrors.email = 'Informe um e-mail válido.';
        }

        if (!form.university) {
            nextErrors.university = 'Informe a universidade.';
        }

        if (!form.course.trim()) {
            nextErrors.course = 'Informe o curso.';
        }

        if (
            Number.isNaN(form.semester) ||
            form.semester < 1 ||
            form.semester > 10
        ) {
            nextErrors.semester = 'O semestre deve estar entre 1 e 10.';
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!cpf || !candidate) {
            setGeneralError('CPF do candidato não fornecido.');
            return;
        }

        if (!validate()) {
            return;
        }

        try {
            setIsSubmitting(true);
            setGeneralError(null);

            await updateCandidate(cpf, {
                fullName: normalizeText(form.fullName),
                rg: form.rg,
                dateOfBirth: form.dateOfBirth,
                motherName: normalizeText(form.motherName),
                address: normalizeText(form.address),
                phoneNumber: form.phoneNumber,
                email: normalizeText(form.email),
                university: form.university,
                course: normalizeText(form.course),
                semester: form.semester,
                period: form.period,
                chosenArea: form.chosenArea,
                chosenCity: form.chosenCity,
                afroDescendant: form.afroDescendant,
                needsSpecialAssistance: form.needsSpecialAssistance,
                deliveredFood: form.deliveredFood,
            });

            navigate('/admin/candidatos', { replace: true });
        } catch (error) {
            setGeneralError(
                error instanceof Error
                    ? error.message
                    : 'Não foi possível salvar as alterações.',
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <section className="admin-dashboard">
                <header>
                    <h1>Editar candidato</h1>
                    <p>Carregando dados do candidato...</p>
                </header>
            </section>
        );
    }

    if (loadError || !candidate) {
        return (
            <section className="admin-dashboard">
                <header>
                    <h1>Editar candidato</h1>
                    <p className="form-error">{loadError || 'Candidato não encontrado.'}</p>
                </header>
                <button
                    type="button"
                    className="primary-button"
                    onClick={() => navigate('/admin/candidatos', { replace: true })}
                >
                    Voltar
                </button>
            </section>
        );
    }

    return (
        <section className="admin-dashboard">
            <header>
                <h1>Editar candidato</h1>
                <p>Atualize os dados da inscrição do candidato.</p>
            </header>

            <form className="publication-form" onSubmit={handleSubmit} noValidate>
                {generalError ? (
                    <p className="form-error">{generalError}</p>
                ) : null}

                <div className="form-grid">
                    <label className="form-field">
                        <span>CPF (não editável)</span>
                        <input
                            type="text"
                            value={candidate.cpf}
                            disabled
                            style={{
                                backgroundColor: '#f1f5f9',
                                cursor: 'not-allowed',
                                opacity: 0.7,
                            }}
                        />
                    </label>

                    <label className="form-field">
                        <span>Nome completo</span>
                        <input
                            type="text"
                            value={form.fullName}
                            onChange={handleChange('fullName')}
                            required
                        />
                        {errors.fullName ? (
                            <span className="field-error">{errors.fullName}</span>
                        ) : null}
                    </label>

                    <label className="form-field">
                        <span>RG</span>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={form.rg}
                            onChange={handleChange('rg')}
                            maxLength={14}
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
                            onChange={handleChange('dateOfBirth')}
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
                            onChange={handleChange('motherName')}
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
                            onChange={handleChange('address')}
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
                            onChange={handleChange('phoneNumber')}
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
                            onChange={handleChange('email')}
                            onBlur={() => {
                                if (form.email) {
                                    if (!isValidEmail(form.email)) {
                                        setErrors((previous) => ({
                                            ...previous,
                                            email: 'Informe um e-mail válido.',
                                        }));
                                    } else {
                                        setErrors((previous) => ({
                                            ...previous,
                                            email: undefined,
                                        }));
                                    }
                                }
                            }}
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
                            onChange={handleChange('university')}
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
                            onChange={handleChange('course')}
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
                            onChange={handleChange('semester')}
                            required
                        >
                            {Array.from({ length: 10 }, (_, i) => i + 1).map(
                                (semester) => (
                                    <option key={semester} value={semester}>
                                        {semester}
                                    </option>
                                ),
                            )}
                        </select>
                        {errors.semester ? (
                            <span className="field-error">{errors.semester}</span>
                        ) : null}
                    </label>

                    <label className="form-field">
                        <span>Turno</span>
                        <select
                            value={form.period}
                            onChange={handleChange('period')}
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
                            onChange={handleChange('chosenArea')}
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
                            onChange={handleChange('chosenCity')}
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
                            onChange={handleChange('afroDescendant')}
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
                            onChange={handleChange('needsSpecialAssistance')}
                        />
                        <span>
                            O candidato é pessoa com deficiência, segundo os
                            critérios da Lei 13.145/2015
                        </span>
                    </label>

                    <label className="form-field checkbox-field">
                        <input
                            type="checkbox"
                            checked={form.deliveredFood}
                            onChange={handleChange('deliveredFood')}
                        />
                        <span>Entregou alimento</span>
                    </label>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button
                        type="submit"
                        className="primary-button"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Salvando...' : 'Salvar alterações'}
                    </button>
                    <button
                        type="button"
                        className="secondary-button"
                        onClick={() => navigate('/admin/candidatos', { replace: true })}
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </section>
    );
};

