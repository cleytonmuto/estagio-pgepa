import { CandidateProfileSection } from '../components/CandidateDashboard';
import type { CandidateProfile } from '../types/candidate';

interface CandidateProfilePageProps {
    candidate: CandidateProfile;
}

export const CandidateProfilePage = ({
    candidate,
}: CandidateProfilePageProps) => (
    <CandidateProfileSection candidate={candidate} />
);

