import { NavLink, Outlet } from 'react-router-dom';

import type { CandidateProfile } from '../types/candidate';

interface AdminLayoutProps {
    candidate: CandidateProfile;
    onLogout: () => void;
}

const getFirstName = (fullName: string): string => {
    const [firstName] = fullName.trim().split(' ');
    return firstName ?? fullName;
};

export const AdminLayout = ({ candidate, onLogout }: AdminLayoutProps) => {
    const navigationLinks = [
        { to: '/admin/publicacoes', label: 'Publicações' },
        { to: '/admin/candidatos', label: 'Inscrições' },
    ];

    return (
        <div className="app-layout">
            <header className="top-bar">
                <div className="brand">
                    <span className="brand-acronym">PGE-PA</span>
                    <div>
                        <p className="brand-title">Painel administrativo</p>
                        <p className="brand-subtitle">
                            Gerenciamento do Programa de Estágio
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
                    <span className="user-greeting">
                        Administrador(a) {getFirstName(candidate.fullName)}
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

