import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Lead {
    name: string;
    email: string;
    phone: string;
    capturedAt: Time;
}
export type Time = bigint;
export interface AnalyticsEntry {
    country: string;
    source: Variant_qr_nfc_direct;
    timestamp: Time;
    deviceType: Variant_desktop_mobile_unknown;
}
export interface UserProfile {
    bio: string;
    linkedIn: string;
    username: string;
    instagram: string;
    name: string;
    whatsapp: string;
    photoUrl: string;
    email: string;
    website: string;
    company: string;
    phone: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_desktop_mobile_unknown {
    desktop = "desktop",
    mobile = "mobile",
    unknown_ = "unknown"
}
export enum Variant_qr_nfc_direct {
    qr = "qr",
    nfc = "nfc",
    direct = "direct"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createOrUpdateProfile(profile: UserProfile): Promise<void>;
    createProfile(profile: UserProfile): Promise<void>;
    getAnalytics(username: string): Promise<Array<AnalyticsEntry>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getLeads(username: string): Promise<Array<Lead>>;
    getPublicProfile(username: string): Promise<UserProfile>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    logProfileView(username: string, deviceType: Variant_desktop_mobile_unknown, country: string, source: Variant_qr_nfc_direct): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitLead(username: string, name: string, phone: string, email: string): Promise<void>;
}
