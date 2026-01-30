# Quick Reference Card 🚀

## Files You Created/Modified

```
✅ .env.example                              - Environment variables template
✅ src/integrations/supabase/client.ts       - Updated to use env variables
✅ src/integrations/supabase/services.ts     - NEW: Service layer
✅ src/integrations/supabase/errors.ts       - NEW: Error handling
✅ src/hooks/useSupabase.ts                  - NEW: React Query hooks
✅ src/pages/ContactPage.tsx                 - Updated to use service layer

📚 Documentation:
✅ IMPLEMENTATION_SUMMARY.md                 - What was done
✅ DATABASE_SETUP_CHECKLIST.md               - How to set up (7 steps)
✅ DATABASE_INTEGRATION_GUIDE.md             - Detailed guide
✅ DATABASE_BEST_PRACTICES.md                - Long-term maintenance
```

---

## Getting Started (Right Now)

### Step 1: Create .env.local
```bash
cat > .env.local << 'EOF'
VITE_SUPABASE_URL=https://kkoipjvvqmqolitceycx.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_Ocl0hv6Lwasbpm5rcsVeYA_RzPCJF7v
EOF
```

### Step 2: Restart dev server
```bash
npm run dev
# or
bun dev
```

### Step 3: Test contact form
- Go to contact page
- Submit a test message
- Should work without errors ✨

---

## Code Snippets

### Use in Components
```typescript
// 1. Import hook
import { useSubmitContact, useContactSubmissions } from '@/hooks/useSupabase';

// 2. Use in component
const submitMutation = useSubmitContact();
const { data: submissions } = useContactSubmissions(userId);

// 3. Call mutation
await submitMutation.mutateAsync(formData);

// 4. Handle errors
catch (error) {
  const msg = getErrorMessage(error);
  toast({ description: msg });
}
```

### Add New Database Operation
```typescript
// 1. In src/integrations/supabase/services.ts
export const myService = {
  async getData() {
    const { data, error } = await supabase.from('my_table').select();
    if (error) throw error;
    return data;
  },
};

// 2. In src/hooks/useSupabase.ts
export const useGetData = () => {
  return useQuery({
    queryKey: ['myData'],
    queryFn: () => myService.getData(),
  });
};

// 3. In component
const { data } = useGetData();
```

---

## Debugging

### Check if env variables loaded
```typescript
// Add to component temporarily
console.log(import.meta.env.VITE_SUPABASE_URL);
```

### Test database connection
```typescript
import { supabase } from '@/integrations/supabase/client';

const { count } = await supabase
  .from('contact_submissions')
  .select('count')
  .single();

console.log('Connected! Submissions:', count);
```

### Monitor React Query
```bash
npm install -D @tanstack/react-query-devtools
# Then wrap app with: <ReactQueryDevtools />
```

---

## What's Better Now?

| Feature | Before | After |
|---------|--------|-------|
| Credentials | Hardcoded | Environment variables |
| Database calls | Scattered in components | Service layer |
| Caching | None | React Query |
| Error handling | Basic | Detailed & user-friendly |
| Type safety | Partial | Full TypeScript |
| Performance | Standard | Optimized |
| Scalability | Manual | Automatic |

---

## Next Week Goals

- [ ] Create .env.local
- [ ] Test contact form works
- [ ] Enable RLS in Supabase
- [ ] Add database indexes
- [ ] Set up monitoring

---

## Emergency Contacts (If Stuck)

1. **Supabase Dashboard** (Settings & Logs)
   - Check API activity for errors
   - Monitor database metrics

2. **Check Documentation**
   - DATABASE_SETUP_CHECKLIST.md (Step-by-step)
   - DATABASE_INTEGRATION_GUIDE.md (Detailed)

3. **Console Errors**
   - Browser DevTools → Console
   - Terminal output → Look for errors

4. **Verify Setup**
   ```bash
   # Correct env variables loaded?
   echo $VITE_SUPABASE_URL
   
   # Right dependencies installed?
   npm list @supabase/supabase-js
   ```

---

## Production Checklist

Before deploying:
- [ ] .env.local has real credentials
- [ ] RLS policies enabled
- [ ] Error logging configured
- [ ] Monitoring set up
- [ ] Backups tested
- [ ] SSL certificates valid

---

## Key Concepts

**Service Layer**: Centralized database operations. Use instead of direct DB calls.

**React Query**: Automatic caching. Data fetched once, cached locally, auto-refetches when stale.

**RLS (Row Level Security)**: Database permissions. Users can only see/edit their own data.

**Type Safety**: TypeScript catches errors at compile time. Database types auto-generated.

**Error Handling**: User-friendly messages instead of technical errors.

---

## Pro Tips 💡

1. **Always use service layer** for new DB features
2. **React Query is your friend** - it handles caching
3. **Check Supabase logs** when things break
4. **Add indexes** on columns you filter by
5. **Test RLS policies** before deploying
6. **Monitor performance** as you scale

---

## Support Resources

- **Docs**: See 3 markdown files above
- **Supabase Docs**: https://supabase.com/docs
- **React Query**: https://tanstack.com/query/latest

---

**Ready?** Start with Step 1 above → Create .env.local → Test the form! 🎉
