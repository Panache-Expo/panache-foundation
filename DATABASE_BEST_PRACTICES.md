# Database Best Practices for Long-Term Maintenance

## 🎯 Core Principles

### 1. **Service Layer Pattern** ✅
All database operations go through `src/integrations/supabase/services.ts`:
- Centralized logic
- Easy to test
- Easy to refactor
- Single source of truth

```typescript
// ✅ Good: Use service layer
const { data } = await contactService.submit(formData);

// ❌ Bad: Direct DB calls scattered in components
const { data } = await supabase.from('contact_submissions').insert([formData]);
```

### 2. **React Query for State Management** ✅
- Automatic caching
- Automatic refetching
- Optimistic updates
- Built-in error handling

```typescript
// ✅ Good: Cached and optimized
const { data } = useContactSubmissions(userId);

// ❌ Bad: New fetch on every render
useEffect(() => {
  supabase.from('contact_submissions').select();
}, []);
```

### 3. **Type Safety** ✅
TypeScript types auto-generated from Supabase schema:
```typescript
import type { ContactSubmission } from '@/integrations/supabase/services';

const submission: ContactSubmission = { /* ... */ };
```

---

## 📋 Maintenance Tasks by Frequency

### Daily
- Monitor error logs
- Check for failed queries
- Verify uptime (set up status page)

### Weekly
- Review database metrics
- Check slow query logs
- Validate RLS policies are working
- Test backups

### Monthly
- Analyze usage patterns
- Review performance metrics
- Plan capacity scaling
- Update dependencies

### Quarterly
- Security audit
- Review RLS policies
- Optimize expensive queries
- Plan major updates

### Yearly
- Full disaster recovery drill
- Review and update documentation
- Plan infrastructure upgrades
- Security penetration testing

---

## 🔒 Security Checklist

### Access Control
- [ ] RLS enabled on all tables
- [ ] Service key only used server-side
- [ ] Anon key has minimal permissions
- [ ] User IDs matched in policies
- [ ] Admin role properly gated

### Data Protection
- [ ] Sensitive fields encrypted
- [ ] PII handling documented
- [ ] GDPR/privacy compliance verified
- [ ] Secrets rotation schedule
- [ ] Audit logging enabled

### Network Security
- [ ] HTTPS enforced
- [ ] CORS configured correctly
- [ ] Rate limiting active
- [ ] DDoS protection enabled
- [ ] Regular security updates

---

## 📊 Performance Optimization Guide

### Query Optimization

#### 1. Always Use Pagination
```typescript
// ❌ Bad: Fetches 10K+ rows
const { data } = await supabase.from('submissions').select();

// ✅ Good: Efficient pagination
const page = 1;
const pageSize = 25;
const { data } = await supabase
  .from('submissions')
  .select()
  .range((page - 1) * pageSize, page * pageSize - 1);
```

#### 2. Select Only Needed Columns
```typescript
// ❌ Bad: Fetches unnecessary data
const { data } = await supabase.from('profiles').select();

// ✅ Good: Specific columns
const { data } = await supabase
  .from('profiles')
  .select('id, name, email');
```

#### 3. Use Proper Filters
```typescript
// ❌ Bad: Fetches all then filters
const submissions = data.filter(s => s.status === 'pending');

// ✅ Good: Filter at database
const { data } = await supabase
  .from('submissions')
  .select()
  .eq('status', 'pending');
```

#### 4. Cache with React Query
```typescript
// React Query automatically:
// - Caches results
// - Deduplicates requests
// - Refetches on focus
// - Provides loading states

const { data, isLoading } = useContactSubmissions(userId);
```

### Database Optimization

#### 1. Index Strategy
```sql
-- Index columns used in WHERE clauses
CREATE INDEX idx_submissions_status ON submissions(status);

-- Index columns used in ORDER BY
CREATE INDEX idx_submissions_created_at ON submissions(created_at DESC);

-- Composite index for common filters
CREATE INDEX idx_submissions_user_status 
  ON submissions(user_id, status);
```

#### 2. Connection Pooling
In Supabase, connection pooling is automatic. Monitor at:
- Settings → Database → Connection String → Pooling

#### 3. Query Monitoring
Enable in Supabase:
1. Settings → Logs → API Activity
2. Filter by duration > 100ms
3. Add indexes to slow queries

---

## 🚨 Error Handling Best Practices

### 1. Always Catch and Log Errors
```typescript
import { logError, getErrorMessage } from '@/integrations/supabase/errors';

try {
  await contactService.submit(data);
} catch (error) {
  logError('contact_submission', error, userId);
  const userMessage = getErrorMessage(error);
  toast({ description: userMessage });
}
```

### 2. Provide User-Friendly Messages
```typescript
const getErrorMessage = (error: any): string => {
  if (error?.message?.includes('duplicate key')) {
    return 'This record already exists';
  }
  if (error?.message?.includes('RLS')) {
    return 'You do not have permission';
  }
  return 'Something went wrong. Please try again.';
};
```

### 3. Implement Retry Logic
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry RLS errors
        if (error?.message?.includes('RLS')) return false;
        // Retry network errors up to 3 times
        return failureCount < 3;
      },
    },
  },
});
```

---

## 🔄 Backup & Disaster Recovery

### Automated Backups (Supabase)
- Daily backups included (all plans)
- 7-day retention (Pro plan)
- 30-day retention (Enterprise plan)

### Manual Backups
```bash
# Export entire database
supabase db dump -f backup.sql

# Export specific table
supabase db dump -f contacts.sql --schema=contact_submissions
```

### Recovery Procedure
1. Create test Supabase project
2. Restore backup to test project
3. Verify data integrity
4. Promote to production
5. Document lessons learned

---

## 📈 Scaling Timeline

### Phase 1: MVP (0-10K users)
- Single Supabase project
- Basic RLS policies
- Standard indexes
- Manual monitoring

### Phase 2: Growth (10K-100K users)
- Add query caching
- Optimize expensive queries
- Automated monitoring
- Daily backups to external storage

### Phase 3: Scale (100K-1M users)
- Read replicas for reporting
- Advanced connection pooling
- Dedicated analytics database
- Auto-scaling configured

### Phase 4: Enterprise (1M+ users)
- Multi-region deployment
- Dedicated Supabase cluster
- Custom SLA
- Dedicated support engineer

---

## 🛠️ Common Issues & Solutions

### Issue: Slow Queries
**Solution**:
1. Check Supabase Logs → API Activity
2. Filter by duration > 100ms
3. Add index to WHERE columns
4. Enable query caching with React Query

### Issue: RLS Violations
**Solution**:
1. Verify user is authenticated
2. Check policy condition: `auth.uid()` returns value
3. Ensure user_id in data matches policy
4. Test with Supabase SQL editor first

### Issue: High Memory Usage
**Solution**:
1. Enable React Query garbage collection
2. Paginate results (don't fetch all)
3. Clear old cache entries
4. Monitor bundle size

### Issue: Auth Token Expired
**Solution**:
```typescript
// Auto-refresh is handled by Supabase client
// (See supabase/client.ts - autoRefreshToken: true)

// Manual refresh if needed:
await supabase.auth.refreshSession();
```

---

## 📚 Documentation

### Required Documentation
- [ ] Database schema diagram
- [ ] RLS policy documentation
- [ ] API error codes
- [ ] Authentication flow
- [ ] Backup/recovery procedures
- [ ] Incident response plan

### Keep Updated
- [ ] Migration history
- [ ] Schema changes
- [ ] Performance baselines
- [ ] Security updates

---

## 🔐 Security Updates

### Monthly
- Update Supabase JavaScript SDK
- Review security advisories
- Check for deprecated APIs

### Quarterly
- Full security audit
- Penetration testing
- Access review

### Yearly
- SOC 2 compliance check
- GDPR compliance review
- Disaster recovery test

---

## 📞 Getting Help

### Supabase Resources
- [Documentation](https://supabase.com/docs)
- [Guides](https://supabase.com/docs/guides)
- [Discord Community](https://discord.supabase.io)
- [GitHub Discussions](https://github.com/supabase/supabase/discussions)

### Debugging Tools
```typescript
// Enable debug logging
if (import.meta.env.DEV) {
  supabase.realtime.setAuth(token);
  console.log('Supabase Debug Mode Enabled');
}

// Check connection
const { data } = await supabase.from('contact_submissions').select('count').single();
console.log('Connection OK:', data);
```

---

## 🎓 Team Training

### Onboarding Checklist
- [ ] Explain service layer pattern
- [ ] Show how to add new database operations
- [ ] Demonstrate React Query hooks usage
- [ ] Review error handling approach
- [ ] Walk through RLS policies
- [ ] Show how to run migrations

### Code Review Checklist
- [ ] Uses service layer (not direct DB calls)
- [ ] Proper error handling implemented
- [ ] React Query hooks used correctly
- [ ] Types are properly defined
- [ ] RLS policies validated
- [ ] No hardcoded credentials
