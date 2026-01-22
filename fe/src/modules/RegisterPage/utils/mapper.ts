import {
    CommunicationPreference,
    LearningStyle,
    type RegisterRequest,
    Role,
    SessionFrequency,
    TeachingStyle,
    UserAvailability,
} from "../types";
import type {
    AccountFormValues,
    PreferencesFormValues,
    ProfileFormValues,
} from "../types";

// Mapping function to convert form values to RegisterRequest
export const mapFormDataToRegisterRequest = (
    accountData: AccountFormValues,
    profileData: ProfileFormValues,
    preferencesData: PreferencesFormValues,
): RegisterRequest => {
    // Map role from string to Role enum
    const roleMap: Record<string, Role> = {
        Learner: Role.Learner,
        Mentor: Role.Mentor,
    };

    // Map communication method to CommunicationPreference enum
    const communicationMap: Record<string, CommunicationPreference> = {
        "Video call": CommunicationPreference.Video,
        "Audio call": CommunicationPreference.Audio,
        "Text chat": CommunicationPreference.Text,
    };

    // Map session frequency to SessionFrequency enum
    const frequencyMap: Record<string, SessionFrequency> = {
        Weekly: SessionFrequency.Week,
        "Every two weeks": SessionFrequency.TwoWeek,
        Monthly: SessionFrequency.Month,
        "As Needed": SessionFrequency.AsNeeded,
    };

    // Map learning style to LearningStyle enum
    const learningStyleMap: Record<string, LearningStyle> = {
        Visual: LearningStyle.Visual,
        Auditory: LearningStyle.Auditory,
        "Reading/Writing": LearningStyle.ReadWriting,
        Kinesthetic: LearningStyle.Kinesthetic,
    };

    // Map availability to UserAvailability enum array
    const mapAvailability = (
        availabilities: string[] | undefined,
    ): UserAvailability[] | undefined => {
        if (!availabilities || availabilities.length === 0) {
            return undefined;
        }

        const availabilityMap: Record<string, UserAvailability> = {
            Weekdays: UserAvailability.Weekdays,
            Weekends: UserAvailability.Weekends,
            Mornings: UserAvailability.Mornings,
            Afternoons: UserAvailability.Afternoons,
            Evenings: UserAvailability.Evenings,
        };

        return availabilities.map((a) => availabilityMap[a]);
    };

    // Map teaching approach to TeachingStyle enum array
    const mapTeachingStyles = (
        approach?: string | null,
    ): TeachingStyle[] | undefined => {
        if (!approach) return undefined;

        const styleMap: Record<string, TeachingStyle> = {
            handson: TeachingStyle.HandsOnPractice,
            discussion: TeachingStyle.DiscussionBased,
            project: TeachingStyle.ProjectBased,
            lecture: TeachingStyle.LectureStyle,
        };

        return [styleMap[approach] || TeachingStyle.LectureStyle];
    };

    // Calculate duration in minutes from session duration string
    const mapDuration = (duration: string): number => {
        const durationMap: Record<string, number> = {
            "30 minutes": 30,
            "45 minutes": 45,
            "1 hour": 60,
            "1.5 hours": 90,
            "2 hours": 120,
        };

        return durationMap[duration] || 60;
    };

    // Determine role
    const role = roleMap[profileData.role] || Role.Learner;
    const isMentor = role === Role.Mentor;

    return {
        email: accountData.email,
        password: accountData.password,
        avatarUrl: profileData.photo,
        fullName: profileData.fullName,
        role: role,
        bio: profileData.bio,
        isNotification: preferencesData.privacySettings?.isNotification,
        isReceiveMessage: preferencesData.privacySettings?.isReceiveMessage,
        isPrivateProfile: preferencesData.privacySettings?.isPrivateProfile,
        expertises: profileData.expertises,
        professionalSkill: profileData.professionalSkill,
        experience: profileData.experience,
        communicationPreference:
            communicationMap[profileData.communicationPreference],
        goals: profileData.goals,
        availability: mapAvailability(profileData.availability),
        courseCategoryIds: preferencesData.courseCategoryIds,
        sessionFrequency: frequencyMap[preferencesData.sessionFrequency],
        duration: mapDuration(preferencesData.duration),
        learningStyle: preferencesData.learningStyle
            ? learningStyleMap[preferencesData.learningStyle]
            : null,
        teachingStyles: isMentor
            ? mapTeachingStyles(preferencesData.teachingStyles)
            : undefined,
    };
};
