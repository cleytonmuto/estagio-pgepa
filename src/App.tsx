import { useState } from 'react';
import {
    BrowserRouter,
    Navigate,
    Route,
    Routes,
    useNavigate,
} from 'react-router-dom';

import './App.css';
import { AdminLayout } from './components/AdminLayout';
import { AdminCandidateList } from './components/AdminCandidateList';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthenticatedLayout } from './components/AuthenticatedLayout';
import { NoticeBoard } from './components/NoticeBoard';
import { AuthPage } from './pages/AuthPage';
import { CandidateProfilePage } from './pages/CandidateProfilePage';
import type { CandidateProfile } from './types/candidate';
import { AdminPublicationCreatePage } from './pages/admin/AdminPublicationCreatePage';
import { AdminPublicationEditPage } from './pages/admin/AdminPublicationEditPage';

interface CandidateAppProps {
    candidate: CandidateProfile;
    onLogout: () => void;
}

const CandidateApp = ({
    candidate,
    onLogout,
    onProfileUpdate,
}: CandidateAppProps & {
    onProfileUpdate?: (updatedCandidate: CandidateProfile) => void;
}) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        onLogout();
        navigate('/login', { replace: true });
    };

    return (
        <Routes>
            <Route
                element={
                    <AuthenticatedLayout
                        candidate={candidate}
                        onLogout={handleLogout}
                    />
                }
            >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<NoticeBoard />} />
                <Route
                    path="/perfil"
                    element={
                        <CandidateProfilePage
                            candidate={candidate}
                            onProfileUpdate={onProfileUpdate}
                        />
                    }
                />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
        </Routes>
    );
};

interface AdminAppProps {
    candidate: CandidateProfile;
    onLogout: () => void;
}

const AdminApp = ({ candidate, onLogout }: AdminAppProps) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        onLogout();
        navigate('/login', { replace: true });
    };

    return (
        <Routes>
            <Route
                element={
                    <AdminLayout candidate={candidate} onLogout={handleLogout} />
                }
            >
                <Route index element={<Navigate to="/admin/publicacoes" replace />} />
                <Route path="/admin/publicacoes" element={<AdminDashboard />} />
                <Route
                    path="/admin/publicacoes/nova"
                    element={<AdminPublicationCreatePage />}
                />
                <Route
                    path="/admin/publicacoes/editar/:id"
                    element={<AdminPublicationEditPage />}
                />
                <Route
                    path="/admin/candidatos"
                    element={<AdminCandidateList />}
                />
                <Route
                    path="*"
                    element={<Navigate to="/admin/publicacoes" replace />}
                />
            </Route>
        </Routes>
    );
};

function App() {
    const [currentUser, setCurrentUser] = useState<CandidateProfile | null>(null);

    return (
        <BrowserRouter>
            {currentUser ? (
                currentUser.role === 'administrator' ? (
                    <AdminApp
                        candidate={currentUser}
                        onLogout={() => setCurrentUser(null)}
                    />
                ) : (
                    <CandidateApp
                        candidate={currentUser}
                        onLogout={() => setCurrentUser(null)}
                        onProfileUpdate={(updatedCandidate) =>
                            setCurrentUser(updatedCandidate)
                        }
                    />
                )
            ) : (
                <div className="app-shell">
                    <Routes>
                        <Route
                            path="/login"
                            element={
                                <AuthPage
                                    onAuthenticated={(profile) =>
                                        setCurrentUser(profile)
                                    }
                                />
                            }
                        />
                        <Route
                            path="*"
                            element={<Navigate to="/login" replace />}
                        />
                    </Routes>
                </div>
            )}
        </BrowserRouter>
    );
}

export default App;
