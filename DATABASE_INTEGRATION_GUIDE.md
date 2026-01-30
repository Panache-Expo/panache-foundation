# Database Integration & Scaling Guide

## ✅ Current Setup
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Data Fetching**: React Query
- **Type Safety**: TypeScript with auto-generated types

## 📋 Implementation Checklist

### Phase 1: Immediate (Setup)
- [x] Environment variables configured
- [x] Client validation added
- [x] Service layer created for encapsulation
- [x] React Query hooks established

### Phase 2: Short-term (Production Ready)
- [ ] Set up `.env.local` with your credentials
- [ ] Configure Row Level Security (RLS) policies in Supabase
- [ ] Add error handling & logging
- [ ] Set up monitoring/alerting
- [ ] Test rate limiting needs

**Action**: Go to Supabase Dashboard → Authentication → Policies
Enable RLS on all tables and create appropriate policies

### Phase 3: Medium-term (Optimization)
- [ ] Add database indexes on frequently queried columns
- [ ] Implement request caching strategies
- [ ] Set up connection pooling
- [ ] Monitor slow queries

**Action**: Run migrations for indexes:
```sql
CREATE INDEX idx_contact_user_id ON contact_submissions(user_id);
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
```

### Phase 4: Long-term (Scalability)
- [ ] Implement real-time subscriptions for live updates
- [ ] Add pagination to large queries
- [ ] Use database functions for complex operations
- [ ] Set up analytics/reporting

## 🚀 Performance Optimization

### 1. Query Optimization
```typescript
// ❌ Bad: Fetches all data
const { data } = await supabase.from('contact_submissions').select();

// ✅ Good: Paginated with filters
const { data } = await supabase
  .from('contact_submissions')
  .select()
  .eq('user_id', userId)
  .range(0, 24)  // 25 items per page
  .order('created_at', { ascending: false });
```

### 2. Caching Strategy
React Query handles this automatically with `staleTime`:
- Short-lived: 1-5 minutes (frequently changing data)
- Medium-lived: 5-30 minutes (user profiles)
- Long-lived: 1+ hours (static reference data)

### 3. Real-time Features
```typescript
export const useContactSubmissionsRealtime = (userId: string) => {
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    const subscription = supabase
      .from(`contact_submissions`)
      .on('*', (payload) => {
        if (payload.new.user_id === userId) {
          setSubmissions(prev => [...prev, payload.new]);
        }
      })
      .subscribe();

    return () => subscription.unsubscribe();
  }, [userId]);

  return submissions;
};
```

## 🔒 Security Best Practices

### 1. Row Level Security (RLS)
Enable for all tables and create policies:
```sql
-- Allow users to read their own submissions
CREATE POLICY "Users can read their own submissions"
ON contact_submissions FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to insert their own submissions
CREATE POLICY "Users can insert their own submissions"
ON contact_submissions FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

### 2. Rate Limiting
Supabase provides built-in rate limiting. Configure in dashboard:
- Auth endpoints: 4 requests/sec per IP
- API endpoints: 150 requests/sec

### 3. Secrets Management
- Never commit `.env.local` (already in .gitignore)
- For CI/CD, use GitHub Secrets
- Rotate service keys annually

## 📊 Monitoring & Logging

### Set up logging:
```typescript
export const logError = (context: string, error: any) => {
  console.error(`[${context}]`, error);
  // TODO: Send to external service (Sentry, LogRocket, etc)
};

export const logQuery = (table: string, operation: string, duration: number) => {
  console.log(`[QUERY] ${table}.${operation} took ${duration}ms`);
  // TODO: Send to analytics service
};
```

## 🔄 Backup & Recovery

1. **Automated Backups**: Supabase provides daily backups (included)
2. **Manual Exports**: Use Supabase CLI
3. **Point-in-time Recovery**: Available up to 7 days (Pro plan)

**Setup automated backups** in Supabase Dashboard → Settings → Backups

## 💾 Database Migrations

Use Supabase CLI for version control:
```bash
# Generate migration
supabase migration new add_new_table

# Apply migrations
supabase migration up

# View migration status
supabase migration list
```

## 🎯 Traffic Scaling Recommendations

| Traffic Level | Strategy | Supabase Plan |
|---|---|---|
| < 50K MAU | Single region, basic RLS | Free/Pro |
| 50K-500K MAU | Multi-region read replicas, optimized indexes | Pro |
| 500K+ MAU | Dedicated cluster, advanced caching, CDN | Enterprise |

## 🛠️ Development Workflow

1. **Local Development**: Use Supabase local development
   ```bash
   supabase start
   ```

2. **Testing**: Use TypeScript types for compile-time safety

3. **Staging**: Use separate Supabase project

4. **Production**: Enable all security policies, monitoring

## 📚 Useful Resources

- [Supabase Docs](https://supabase.com/docs)
- [React Query Docs](https://tanstack.com/query/latest)
- [PostgreSQL Performance Tips](https://www.postgresql.org/docs/current/performance-tips.html)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

## 🚨 Common Issues & Solutions

### Connection Timeouts
- Increase connection pool size in Supabase settings
- Add retry logic to mutations

### Slow Queries
- Add indexes on frequently filtered columns
- Use pagination instead of fetching all data

### Rate Limiting
- Implement request queuing
- Add exponential backoff for retries

### High Memory Usage
- Paginate large result sets
- Enable garbage collection for old cache entries
