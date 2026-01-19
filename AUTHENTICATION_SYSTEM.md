# Authentication and Authorization

## Overview
UIU Talent Showcase uses a 3-role model (viewer, creator, admin) backed by a PHP API and JWT tokens.
Roles are normalized in both the frontend and backend to avoid invalid values.

## Roles and Capabilities

- Viewer: view content only
- Creator: upload and manage own content
- Admin: approve/reject content and manage all posts

## Backend Flow
- Login: `backend/api/auth/login.php` returns user + token
- Register: `backend/api/auth/register.php` creates a user and returns a token
- Tokens are stored in localStorage and sent via `Authorization: Bearer <token>`

## Frontend Integration
Key files:
- `frontend/src/contexts/AuthContext.tsx` (session state and auth actions)
- `frontend/src/utils/permissions.ts` (permission checks)
- `frontend/src/components/auth/ProtectedRoute.tsx` (route gating)
- `frontend/src/types/auth.ts` (`normalizeRole` and role types)

## Password Handling
- Passwords are stored as hashes
- Legacy plaintext passwords are accepted and upgraded on login

## Test Accounts
- Viewer: `viewer@uiu.ac.bd` / `viewer123`
- Creator: `creator@uiu.ac.bd` / `creator123`
- Admin: `admin@uiu.ac.bd` / `admin123`
