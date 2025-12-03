import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';

import { updateCandidate } from '../services/candidateService';
import type {
    CandidateProfile,
    InternshipArea,
    InternshipCity,
    StudyPeriod,
} from '../types/candidate';
import { normalizeText } from '../utils/text';
import { isValidEmail } from '../utils/email';

interface CandidateProfileEditProps {
    candidate: CandidateProfile;
    onSave: (updatedCandidate: CandidateProfile) => void;
    onCancel: () => void;
}

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

export const CandidateProfileEdit = ({
    candidate,
    onSave,
    onCancel,
}: CandidateProfileEditProps) => {
    const [form, setForm] = useState({
        fullName: candidate.fullName,
        rg: candidate.rg,
        dateOfBirth: candidate.dateOfBirth,
        motherName: candidate.motherName,
        address: candidate.address,
        phoneNumber: candidate.phoneNumber,
        email: candidate.email,
        university: candidate.university,
        course: candidate.course,
        semester: candidate.semester,
        period: candidate.period,
        chosenArea: candidate.chosenArea,
        chosenCity: candidate.chosenCity,
        afroDescendant: candidate.afroDescendant,
        needsSpecialAssistance: candidate.needsSpecialAssistance,
    });

    const [errors, setErrors] = useState<Record<string, string | undefined>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [generalError, setGeneralError] = useState<string | null>(null);

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

        if (!validate()) {
            return;
        }

        try {
            setIsSubmitting(true);
            setGeneralError(null);

            const updatedCandidate = await updateCandidate(candidate.cpf, {
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
            });

            onSave(updatedCandidate);
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

    return (
        <section className="dashboard">
            <header className="dashboard-header">
                <div>
                    <h1>Editar dados pessoais</h1>
                    <p>Atualize suas informações de cadastro.</p>
                </div>
            </header>

            <form className="publication-form" onSubmit={handleSubmit} noValidate>
                {generalError ? (
                    <p className="form-error">{generalError}</p>
                ) : null}

                <div className="form-grid">
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
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </section>
    );
};

