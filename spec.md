# TapCard - Smart NFC Business Card Platform

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- User authentication (sign up / login) with role-based access
- Digital profile page per user (photo, name, company, phone, email, website, bio, social links)
- Unique profile URL per user (e.g. `/u/<username>`) for NFC card programming
- Lead capture form on public profile pages (name, phone, email)
- User dashboard: profile views, NFC taps, leads list, CSV export
- Basic analytics: visit count, device type, country tracking
- Auto-generated QR code for each user's profile URL
- Blob storage for profile photos
- Mobile-first responsive design

### Modify
N/A

### Remove
N/A

## Implementation Plan

### Backend (Motoko)
- User profile store: userId -> Profile (name, company, phone, email, website, bio, photo blobId, social links, username)
- Analytics store: profileId -> AnalyticsEntry[] (timestamp, deviceType, country, source: 'nfc' | 'qr' | 'direct')
- Leads store: profileId -> Lead[] (name, phone, email, capturedAt)
- Public API: getProfileByUsername, recordVisit, submitLead
- Authenticated API: updateProfile, getDashboard (views, nfc taps, leads), exportLeads
- Authorization for account-bound data (only profile owner accesses their dashboard/leads)

### Frontend
- Auth pages: Login, Sign Up
- Dashboard: stats cards (views, taps, leads), leads table with CSV export, profile editor
- Profile editor: form with all fields + photo upload
- Public profile page: /u/:username — card-style layout with contact info, social links, lead capture form
- QR code display on dashboard linking to user's profile URL
- Analytics summary section on dashboard
- Mobile-optimized layout throughout
