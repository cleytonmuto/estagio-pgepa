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
    department: 'Órgão emissor',
    motherName: 'Nome da mãe',
    address: 'Endereço',
    phoneNumber: 'Telefone',
    email: 'E-mail',
    university: 'Instituição de Ensino Superior',
    course: 'Curso',
    semester: 'Semestre',
    period: 'Período',
    chosenArea: 'Área escolhida',
    chosenCity: 'Cidade',
    afroDescendant: 'Afrodescendente',
    needsSpecialAssistance: 'Necessita de atendimento especial',
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
            {(Object.keys(candidate) as Array<keyof CandidateProfile>)
                .filter((field) => field !== 'id')
                .map((field) => (
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
