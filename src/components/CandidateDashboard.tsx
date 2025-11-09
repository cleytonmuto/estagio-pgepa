import type { CandidateProfile } from '../types/candidate';
import { formatCpf } from '../utils/cpf';

interface CandidateProfileSectionProps {
    candidate: CandidateProfile;
}

const labelMap: Record<keyof CandidateProfile, string> = {
    id: 'Identificador',
    fullName: 'Nome completo',
    cpf: 'CPF',
    rg: 'RG',
    dateOfBirth: 'Data de nascimento',
    motherName: 'Nome da mãe',
    address: 'Endereço',
    phoneNumber: 'Telefone',
    email: 'E-mail',
    university: 'Instituição de Ensino Superior',
    course: 'Curso',
    semester: 'Semestre',
    period: 'Período',
    chosenArea: 'Área escolhida',
    chosenCity: 'Município desejado',
    afroDescendant: 'Afrodescendente',
    needsSpecialAssistance: 'Necessita de atendimento especial',
    role: 'Perfil do usuário',
};

const formatValue = (
    field: keyof CandidateProfile,
    value: CandidateProfile[keyof CandidateProfile]
) => {
    if (typeof value === 'boolean') {
        return value ? 'Sim' : 'Não';
    }

    if (field === 'period') {
        switch (value) {
            case 'morning':
                return 'Manhã';
            case 'afternoon':
                return 'Tarde';
            case 'night':
                return 'Noite';
            default:
                return value;
        }
    }

    if (field === 'cpf') {
        return formatCpf(String(value));
    }

    if (field === 'dateOfBirth') {
        const dateValue = new Date(String(value));
        if (Number.isNaN(dateValue.getTime())) {
            return value;
        }
        return dateValue.toLocaleDateString('pt-BR');
    }

    if (field === 'chosenArea') {
        switch (value) {
            case 'administration':
                return 'Administração';
            case 'biblioteconomy':
                return 'Biblioteconomia';
            case 'contability':
                return 'Contabilidade';
            case 'law':
                return 'Direito';
            case 'computers':
                return 'Informática';
            default:
                return value;
        }
    }

    return value;
};

export const CandidateProfileSection = ({
    candidate,
}: CandidateProfileSectionProps) => (
    <section className="dashboard">
        <header className="dashboard-header">
            <div>
                <h1>Dados do candidato</h1>
                <p>Consulte as informações enviadas na sua inscrição.</p>
            </div>
        </header>

        <div className="dashboard-grid">
            {(
                [
                    'fullName',
                    'cpf',
                    'rg',
                    'dateOfBirth',
                    'motherName',
                    'address',
                    'phoneNumber',
                    'email',
                    'university',
                    'course',
                    'semester',
                    'period',
                    'chosenArea',
                    'chosenCity',
                    'afroDescendant',
                    'needsSpecialAssistance',
                ] satisfies Array<keyof CandidateProfile>
            ).map((field) => (
                <div key={field} className="dashboard-card">
                    <span className="card-label">{labelMap[field]}</span>
                    <p className="card-value">
                        {formatValue(field, candidate[field])}
                    </p>
                </div>
            ))}
        </div>
    </section>
);
