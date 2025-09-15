import type { TeamInfo, MemberInfo } from "@/components/RegistrationForm";

interface RegistrationData {
  teamInfo: TeamInfo | null;
  members: MemberInfo[];
  currentStep: number;
  timestamp: number;
  ctfCompleted?: boolean;
}

const STORAGE_KEY = "medusa-registration-data";
const EXPIRY_HOURS = 24; // Data expires after 24 hours

export const saveRegistrationData = (teamInfo: TeamInfo | null, members: MemberInfo[], currentStep: number, ctfCompleted?: boolean) => {
  try {
    const data: RegistrationData = {
      teamInfo,
      members,
      currentStep,
      timestamp: Date.now(),
      ctfCompleted: ctfCompleted ?? getCtfCompletionStatus()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save registration data:", error);
  }
};

export const loadRegistrationData = (): RegistrationData | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const data: RegistrationData = JSON.parse(stored);
    
    // Check if data has expired
    const hoursElapsed = (Date.now() - data.timestamp) / (1000 * 60 * 60);
    if (hoursElapsed > EXPIRY_HOURS) {
      clearRegistrationData();
      return null;
    }

    return data;
  } catch (error) {
    console.error("Failed to load registration data:", error);
    clearRegistrationData();
    return null;
  }
};

export const clearRegistrationData = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear registration data:", error);
  }
};

export const hasIncompleteRegistration = (): boolean => {
  const data = loadRegistrationData();
  return data !== null && data.currentStep < 4; // Step 4 would be completion
};

// CTF Challenge Management
const CTF_COMPLETION_KEY = "medusa-ctf-completed";
const CTF_CHALLENGE_URL = "https://medusa-main-0f96d0a.azurewebsites.net/";

export const markCtfCompleted = () => {
  try {
    localStorage.setItem(CTF_COMPLETION_KEY, "true");
  } catch (error) {
    console.error("Failed to mark CTF as completed:", error);
  }
};

export const getCtfCompletionStatus = (): boolean => {
  try {
    return localStorage.getItem(CTF_COMPLETION_KEY) === "true";
  } catch (error) {
    console.error("Failed to get CTF completion status:", error);
    return false;
  }
};

export const clearCtfCompletion = () => {
  try {
    localStorage.removeItem(CTF_COMPLETION_KEY);
  } catch (error) {
    console.error("Failed to clear CTF completion:", error);
  }
};

export const shouldRedirectToCtf = (): boolean => {
  // If user has completed CTF or has incomplete registration, don't redirect
  return !getCtfCompletionStatus() && !hasIncompleteRegistration();
};

export const getCtfChallengeUrl = (): string => {
  return CTF_CHALLENGE_URL;
};