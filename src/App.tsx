import { useState } from 'react';
import {
    BrowserRouter,
    Navigate,
    Route,
    Routes,
    useNavigate,
} from 'react-router-dom';

import './App.css';
import { AuthenticatedLayout } from './components/AuthenticatedLayout';
import { NoticeBoard } from './components/NoticeBoard';
import { AuthPage } from './pages/AuthPage';
import { CandidateProfilePage } from './pages/CandidateProfilePage';
import type { CandidateProfile } from './types/candidate';

interface AuthenticatedAppProps {
    candidate: CandidateProfile;
    onLogout: () => void;
}

const AuthenticatedApp = ({ candidate, onLogout }: AuthenticatedAppProps) => {
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
                    element={<CandidateProfilePage candidate={candidate} />}
                />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
        </Routes>
    );
};

function App() {
    const [candidate, setCandidate] = useState<CandidateProfile | null>(null);

    return (
        <BrowserRouter>
            {candidate ? (
                <AuthenticatedApp
                    candidate={candidate}
                    onLogout={() => setCandidate(null)}
                />
            ) : (
                <div className="app-shell">
                    <Routes>
                        <Route
                            path="/login"
                            element={
                                <AuthPage
                                    onAuthenticated={(profile) =>
                                        setCandidate(profile)
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
