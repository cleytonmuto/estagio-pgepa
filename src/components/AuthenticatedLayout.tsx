import { NavLink, Outlet } from 'react-router-dom';

import type { CandidateProfile } from '../types/candidate';
import { DarkModeToggle } from './DarkModeToggle';

interface AuthenticatedLayoutProps {
    candidate: CandidateProfile;
    onLogout: () => void;
}

const getCandidateFirstName = (fullName: string): string => {
    const [firstName] = fullName.trim().split(' ');
    return firstName ?? fullName;
};

export const AuthenticatedLayout = ({
    candidate,
    onLogout,
}: AuthenticatedLayoutProps) => {
    const navigationLinks = [
        { to: '/dashboard', label: 'Avisos' },
        { to: '/perfil', label: 'Dados do candidato' },
    ];

    return (
        <div className="app-layout">
            <header className="top-bar">
                <div className="brand">
                    <span className="brand-acronym">PGE-PA</span>
                    <div>
                        <p className="brand-title">Programa de Estágio</p>
                        <p className="brand-subtitle">
                            Procuradoria-Geral do Estado do Pará
                        </p>
                    </div>
                </div>

                <nav className="nav-links">
                    {navigationLinks.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            className={({ isActive }) =>
                                `nav-link${isActive ? ' nav-link-active' : ''}`
                            }
                        >
                            {link.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="user-actions">
                    <DarkModeToggle />
                    <span className="user-greeting">
                        Olá, {getCandidateFirstName(candidate.fullName)}!
                    </span>
                    <button
                        type="button"
                        className="secondary-button"
                        onClick={onLogout}
                    >
                        Sair
                    </button>
                </div>
            </header>

            <main className="content-area">
                <Outlet />
            </main>
        </div>
    );
};

