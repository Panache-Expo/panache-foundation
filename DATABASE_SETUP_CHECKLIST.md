# Database Setup Checklist

## 🔧 Quick Setup (Do This First)

### Step 1: Environment Variables
Create `.env.local` in your project root:
```bash
VITE_SUPABASE_URL=https://kkoipjvvqmqolitceycx.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_Ocl0hv6Lwasbpm5rcsVeYA_RzPCJF7v
```

Add to `.gitignore` (if not already):
```
.env.local
.env.*.local
```

### Step 2: Verify the Updated Files
The following files have been created/updated:
- ✅ `src/integrations/supabase/client.ts` - Uses env variables
- ✅ `src/integrations/supabase/services.ts` - Service layer for all DB operations
- ✅ `src/integrations/supabase/errors.ts` - Error handling utilities
- ✅ `src/hooks/useSupabase.ts` - React Query hooks for caching
- ✅ `src/pages/ContactPage.tsx` - Updated to use service layer

### Step 3: Install Missing Dependencies
Your project already has React Query, but verify:
```bash
npm install @tanstack/react-query
# or if using bun:
bun install
```

### Step 4: Wrap Your App with QueryClientProvider
Update your `src/main.tsx`:
```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);
```

---

## 🛡️ Security Setup (Critical for Production)

### Step 5: Enable Row Level Security (RLS)

Go to **Supabase Dashboard** → **Authentication** → **Policies**

For `contact_submissions` table:
```sql
-- Policy: Allow authenticated users to insert submissions
CREATE POLICY "Enable insert for authenticated users only"
ON contact_submissions
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Policy: Allow users to view their own submissions
CREATE POLICY "Users can view their own submissions"
ON contact_submissions
FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);

-- Policy: Only admins can delete submissions
CREATE POLICY "Only admins can delete submissions"
ON contact_submissions
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = 'admin'
));
```

For `profiles` table:
```sql
-- Policy: Users can only view and update their own profile
CREATE POLICY "Users can view their own profile"
ON profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

### Step 6: Configure Authentication
In **Supabase Dashboard** → **Settings** → **Auth**:
- ✅ Enable Email/Password auth
- ✅ Enable Email confirmations
- ✅ Set JWT expiry to 1 hour
- ✅ Set refresh token rotation enabled
- ✅ Configure allowed redirect URLs (your domain)

---

## 📊 Database Optimization (Performance)

### Step 7: Add Indexes
In **Supabase Dashboard** → **SQL Editor**, run:
```sql
-- Index for contact_submissions queries
CREATE INDEX idx_contact_submissions_user_id 
  ON contact_submissions(user_id);

CREATE INDEX idx_contact_submissions_created_at 
  ON contact_submissions(created_at DESC);

CREATE INDEX idx_contact_submissions_email 
  ON contact_submissions(email);

-- Index for profiles queries
CREATE INDEX idx_profiles_user_id 
  ON profiles(user_id);
```

### Step 8: Monitor Query Performance
Enable **Supabase Analytics**:
1. Go to **Settings** → **Logs**
2. Monitor slow queries (> 100ms)
3. Add indexes to frequently filtered columns

---

## 🔄 Development Workflow

### Step 9: Local Development Setup
```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase instance
supabase start

# Run migrations
supabase migration up

# Stop when done
supabase stop
```

### Step 10: Database Migrations
For schema changes:
```bash
# Create a new migration
supabase migration new add_new_column

# Edit the generated SQL file

# Apply migrations
supabase migration up
```

---

## 🚀 Deployment Checklist

### Step 11: Before Going Live
- [ ] Enable RLS on all tables
- [ ] Add indexes on frequently queried columns
- [ ] Test authentication flows
- [ ] Set up error logging (Sentry, LogRocket)
- [ ] Configure CORS in Supabase
- [ ] Test rate limiting (4 req/sec per IP for auth)
- [ ] Set up automated backups

### Step 12: Staging Environment
- [ ] Create separate Supabase project for staging
- [ ] Test full workflow before production
- [ ] Monitor performance metrics

### Step 13: Production Environment
- [ ] Enable monitoring/alerting
- [ ] Set up daily backups
- [ ] Configure auto-scaling parameters
- [ ] Document incident response procedures

---

## 📈 Scaling Strategy by Traffic

| Traffic Level | Actions | Timeline |
|---|---|---|
| **Launch (<10K users)** | Basic RLS, standard indexes | Week 1 |
| **Growth (10K-100K)** | Query optimization, caching strategy, monitoring | Month 1-2 |
| **Scale (100K+)** | Connection pooling, read replicas, load balancing | Month 2-6 |
| **Enterprise (1M+)** | Dedicated cluster, custom analytics, dedicated support | Month 6+ |

---

## 🐛 Troubleshooting

### Connection Issues
```typescript
// Add this to src/integrations/supabase/client.ts for debugging
if (import.meta.env.DEV) {
  console.log('Supabase URL:', SUPABASE_URL);
  console.log('Environment:', import.meta.env.MODE);
}
```

### RLS Policy Violations
Check that:
1. User is authenticated (`auth.uid()` returns a value)
2. User ID matches the policy condition
3. Policy is enabled on the table

### Slow Queries
1. Check **Logs** in Supabase dashboard
2. Add indexes on WHERE/ORDER BY columns
3. Use pagination for large datasets
4. Enable query caching with React Query

---

## 📚 Quick Reference

### Import Service Layer
```typescript
import { contactService, profileService, authService } from '@/integrations/supabase/services';
```

### Use React Query Hooks
```typescript
import { useSubmitContact, useContactSubmissions, useProfile } from '@/hooks/useSupabase';

// In component
const submitMutation = useSubmitContact();
const { data: submissions } = useContactSubmissions(userId);
```

### Handle Errors
```typescript
import { getErrorMessage, logError } from '@/integrations/supabase/errors';

try {
  await someOperation();
} catch (error) {
  logError('context', error, userId);
  const message = getErrorMessage(error);
  toast({ description: message });
}
```

---

## 🎯 Next Steps

1. **Immediate**: Set up `.env.local` and verify connection
2. **This week**: Enable RLS policies
3. **This month**: Add indexes and optimize queries
4. **Quarterly**: Monitor metrics and scale as needed

Need help? Check the `DATABASE_INTEGRATION_GUIDE.md` for detailed explanations.
