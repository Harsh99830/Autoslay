# AutoSlay Backend

Node.js/Express backend with Supabase Auth integration.

## Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Create .env file:**
   ```bash
   cp .env.example .env
   ```

3. **Configure Supabase:**
   - Go to [supabase.com](https://supabase.com) and create a project
   - Copy Project URL and Service Role Key to `.env`
   - Run the SQL in `supabase_schema.sql` in the Supabase SQL Editor

4. **Setup Google OAuth in Supabase:**
   - Go to Supabase Dashboard → Authentication → Providers
   - Enable Google provider
   - Add your Google OAuth credentials (or use Supabase's default)
   - Set callback URL: `http://localhost:5173/auth/callback`

5. **Start the server:**
   ```bash
   npm run dev
   ```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | No | Health check |
| GET | `/user` | Yes | Get user profile |
| POST | `/user/update` | Yes | Update profile |
| POST | `/upload-resume` | Yes | Upload resume file |

## Database Schema

The `profiles` table stores:
- `id` (UUID, references auth.users)
- `name` (text)
- `emails` (text array)
- `phone_numbers` (text array)
- `resumes` (text array of file URLs)
- `linkedin` (text)
- `website` (text)

## Auth Flow

1. Frontend uses Supabase client to sign in with Google
2. Supabase returns JWT access token
3. Frontend stores token in localStorage
4. Frontend sends token in `Authorization: Bearer <token>` header
5. Backend verifies token with Supabase
