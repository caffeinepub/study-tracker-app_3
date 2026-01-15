import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface StudySession {
    startTime: bigint;
    duration: bigint;
    endTime: bigint;
    date: bigint;
    subjectId: string;
}
export type GoalType = {
    __kind__: "timeBased";
    timeBased: bigint;
} | {
    __kind__: "taskBased";
    taskBased: bigint;
};
export interface Subject {
    id: string;
    name: string;
    color: string;
    creationDate: bigint;
}
export interface backendInterface {
    addSubject(id: string, name: string, color: string): Promise<void>;
    editSubject(id: string, name: string, color: string): Promise<void>;
    getDailyGoal(): Promise<GoalType | null>;
    getStudySessions(): Promise<Array<StudySession>>;
    getSubjectSessions(subjectId: string): Promise<Array<StudySession>>;
    getSubjects(): Promise<Array<Subject>>;
    getWeeklySessions(weekStart: bigint, weekEnd: bigint): Promise<Array<StudySession>>;
    recordSession(session: StudySession): Promise<void>;
    removeSubject(id: string): Promise<void>;
    setDailyGoal(goal: GoalType): Promise<void>;
    setTaskBasedGoal(tasks: bigint): Promise<void>;
    setTimeBasedGoal(hours: bigint): Promise<void>;
}
