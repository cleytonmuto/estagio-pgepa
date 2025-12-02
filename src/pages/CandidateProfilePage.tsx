import { useEffect, useState } from 'react';

import { CandidateProfileSection } from '../components/CandidateDashboard';
import { CandidateProfileEdit } from '../components/CandidateProfileEdit';
import { listenToSettings } from '../services/settingsService';
import type { CandidateProfile } from '../types/candidate';

interface CandidateProfilePageProps {
    candidate: CandidateProfile;
    onProfileUpdate?: (updatedCandidate: CandidateProfile) => void;
}

export const CandidateProfilePage = ({
    candidate,
    onProfileUpdate,
}: CandidateProfilePageProps) => {
    const [allowEdit, setAllowEdit] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentCandidate, setCurrentCandidate] = useState(candidate);

    useEffect(() => {
        setCurrentCandidate(candidate);
    }, [candidate]);

    useEffect(() => {
        const unsubscribe = listenToSettings(
            (settings) => {
                setAllowEdit(settings.allowCandidateEdit);
            },
            () => {
                setAllowEdit(false);
            },
        );

        return () => unsubscribe();
    }, []);

    const handleSave = (updatedCandidate: CandidateProfile) => {
        setCurrentCandidate(updatedCandidate);
        setIsEditMode(false);
        onProfileUpdate?.(updatedCandidate);
    };

    const handleCancel = () => {
        setIsEditMode(false);
    };

    if (isEditMode && allowEdit) {
        return (
            <CandidateProfileEdit
                candidate={currentCandidate}
                onSave={handleSave}
                onCancel={handleCancel}
            />
        );
    }

    return (
        <div>
            {allowEdit && (
                <div style={{ marginBottom: '1.5rem', textAlign: 'right' }}>
                    <button
                        type="button"
                        className="primary-button"
                        onClick={() => setIsEditMode(true)}
                    >
                        Editar dados pessoais
                    </button>
                </div>
            )}
            <CandidateProfileSection candidate={currentCandidate} />
        </div>
    );
};

