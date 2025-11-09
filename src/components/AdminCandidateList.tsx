import { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';

import { fetchCandidates } from '../services/candidateService';
import type {
    CandidateProfile,
    InternshipArea,
} from '../types/candidate';
import { formatCpf } from '../utils/cpf';

const areaLabels: Record<InternshipArea, string> = {
    administration: 'Administração',
    biblioteconomy: 'Biblioteconomia',
    contability: 'Contabilidade',
    law: 'Direito',
    computers: 'Informática',
};

export const AdminCandidateList = () => {
    const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        const loadCandidates = async () => {
            try {
                setIsLoading(true);
                const data = await fetchCandidates();
                setCandidates(data);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : 'Não foi possível carregar as inscrições.',
                );
            } finally {
                setIsLoading(false);
            }
        };

        void loadCandidates();
    }, []);

    const sortedCandidates = useMemo(
        () =>
            [...candidates].sort((a, b) =>
                a.fullName.localeCompare(b.fullName, 'pt-BR'),
            ),
        [candidates],
    );

    const handleExport = () => {
        if (candidates.length === 0) {
            return;
        }

        try {
            setIsExporting(true);
            const data = candidates.map((candidate) => ({
                Nome: candidate.fullName,
                CPF: formatCpf(candidate.cpf),
                RG: candidate.rg,
                'Órgão emissor': candidate.department,
                'Nome da mãe': candidate.motherName,
                Endereço: candidate.address,
                Telefone: candidate.phoneNumber,
                Email: candidate.email,
                'Instituição de Ensino Superior': candidate.university,
                Curso: candidate.course,
                Semestre: candidate.semester,
                Turno: candidate.period,
                'Área escolhida': areaLabels[candidate.chosenArea],
                Cidade: candidate.chosenCity,
                'Afrodescendente': candidate.afroDescendant ? 'Sim' : 'Não',
                'Necessita atendimento especial': candidate.needsSpecialAssistance
                    ? 'Sim'
                    : 'Não',
            }));

            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Inscrições');
            XLSX.writeFile(workbook, 'inscricoes_estagio_pgepa.xlsx');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <section className="admin-list">
            <header>
                <h1>Inscrições concluídas</h1>
                <p>
                    Visualize os dados básicos dos candidatos inscritos no
                    programa.
                </p>
            </header>

            {isLoading ? (
                <div className="admin-list-status">Carregando inscrições...</div>
            ) : error ? (
                <div className="admin-list-status admin-list-error">{error}</div>
            ) : (
                <>
                    <button
                        type="button"
                        className="primary-button admin-export-button"
                        onClick={handleExport}
                        disabled={isExporting || candidates.length === 0}
                    >
                        {isExporting
                            ? 'Gerando arquivo...'
                            : 'Exportar inscrições (Excel)'}
                    </button>
                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>CPF</th>
                                    <th>Instituição</th>
                                    <th>Curso</th>
                                    <th>Área</th>
                                    <th>Cidade</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedCandidates.length === 0 ? (
                                    <tr>
                                        <td colSpan={6}>
                                            Nenhuma inscrição foi encontrada até o
                                            momento.
                                        </td>
                                    </tr>
                                ) : (
                                    sortedCandidates.map((candidate) => (
                                        <tr key={candidate.id}>
                                            <td>{candidate.fullName}</td>
                                            <td>{formatCpf(candidate.cpf)}</td>
                                            <td>{candidate.university}</td>
                                            <td>{candidate.course}</td>
                                            <td>{areaLabels[candidate.chosenArea]}</td>
                                            <td>{candidate.chosenCity}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </section>
    );
};

