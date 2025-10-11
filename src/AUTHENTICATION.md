# 🔐 Authentication System - Cangrejeras de Santurce Admin

## Overview

This app now includes a **simple frontend authentication system** to protect the Admin Dashboard. This is a demo/prototype implementation suitable for development and testing.

⚠️ **Important**: This is NOT production-ready authentication. For production, use a real backend authentication system like Supabase, Firebase, Auth0, or your own API.

## Features

✅ **Login Page** - Beautiful glass morphism design matching the app's style
✅ **Session Persistence** - Users stay logged in after page refresh (uses localStorage)
✅ **Multiple User Roles** - Super Admin, Admin, Editor, Moderador
✅ **Logout Functionality** - Secure logout with session cleanup
✅ **Protected Routes** - Admin dashboard only accessible when logged in
✅ **User Display** - Shows logged-in user name and role in admin header

## Demo Credentials

### Primary Admin
- **Email**: admin@cangrejeras.com
- **Password**: admin123
- **Role**: Super Admin

### Additional Users
- **Email**: maria@cangrejeras.com
  - **Password**: maria123
  - **Role**: Admin

- **Email**: carlos@cangrejeras.com
  - **Password**: carlos123
  - **Role**: Editor

## How It Works

### Login Flow
1. User clicks the Settings icon (⚙️) on the fan app
2. If not logged in, they see the login page
3. After successful login, they're redirected to the admin dashboard
4. Session is stored in localStorage for persistence

### Logout Flow
1. User clicks the Logout button (🚪) in the admin dashboard
2. Session is cleared from localStorage
3. User is redirected back to the fan app

### File Structure

```
/utils/auth.ts              # Authentication utility functions
/components/LoginPage.tsx   # Login page component
/App.tsx                    # Main app with auth integration
/AdminApp.tsx              # Admin dashboard (requires auth)
```

## Adding New Users

To add new demo users, edit `/utils/auth.ts`:

```typescript
const DEMO_USERS = {
  'newemail@cangrejeras.com': {
    password: 'password123',
    user: {
      id: '4',
      name: 'New User Name',
      email: 'newemail@cangrejeras.com',
      role: 'Editor' // or 'Super Admin', 'Admin', 'Moderador'
    }
  }
};
```

## User Roles

- **Super Admin** - Full access to all features (cannot be deleted in user management)
- **Admin** - Full access except user management
- **Editor** - Can manage content and news
- **Moderador** - Can moderate comments and content

## Security Notes

### Current Implementation (Demo)
- Passwords stored in plain text in code
- Authentication happens client-side only
- Session stored in localStorage (accessible to JavaScript)
- No server-side validation
- Anyone with code access can see credentials

### For Production Use
You should implement:
- ✅ Backend API for authentication
- ✅ Encrypted password storage (bcrypt, argon2)
- ✅ JWT or session tokens
- ✅ HTTPS only
- ✅ Rate limiting on login attempts
- ✅ Password reset functionality
- ✅ Two-factor authentication (2FA)
- ✅ Secure session management
- ✅ CSRF protection

## Upgrading to Production

### Option 1: Supabase (Recommended)
```bash
npm install @supabase/supabase-js
```
- Built-in authentication
- Row Level Security
- Easy to implement
- Free tier available

### Option 2: Firebase
```bash
npm install firebase
```
- Google's BaaS platform
- Similar to Supabase
- Good documentation

### Option 3: Custom Backend
- Build your own API (Node.js, Python, etc.)
- Full control over authentication flow
- More complex to implement

## API Reference

### `auth.login(email, password)`
Authenticates user and stores session.
- **Returns**: `User | null`

### `auth.logout()`
Clears user session.
- **Returns**: `void`

### `auth.getCurrentUser()`
Gets currently logged-in user from localStorage.
- **Returns**: `User | null`

### `auth.isAuthenticated()`
Checks if user is logged in.
- **Returns**: `boolean`

## User Interface

### Login Page Features
- Email and password inputs with icons
- Error messages for invalid credentials
- Loading state during authentication
- Demo credentials displayed for easy testing
- Responsive design (mobile & desktop)
- Glass morphism styling
- Dark mode support

### Admin Dashboard Features
- User name and role displayed in header
- User avatar with initials
- Logout button (red button with logout icon)
- Home button to return to fan app

## Testing

1. **Test Login**: Use demo credentials to log in
2. **Test Session**: Refresh page - should stay logged in
3. **Test Logout**: Click logout button - should return to login
4. **Test Protected Routes**: Try accessing admin without login

## Troubleshooting

### "Invalid credentials" error
- Double-check email and password
- Ensure no extra spaces
- Check caps lock

### Session lost after refresh
- Check browser localStorage is enabled
- Check for browser privacy/incognito mode

### Can't access admin
- Make sure you're logged in
- Check console for errors
- Clear localStorage and try again

## Future Enhancements

- [ ] Password reset functionality
- [ ] Email verification
- [ ] Two-factor authentication
- [ ] Remember me checkbox
- [ ] Login history/audit log
- [ ] Session timeout
- [ ] Account lockout after failed attempts
- [ ] OAuth (Google, Facebook login)
- [ ] Role-based UI permissions

---

**Built with ❤️ for Cangrejeras de Santurce** 🦀
