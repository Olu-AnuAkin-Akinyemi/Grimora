---
name: cloudflare-backend-architect
description: Deep technical guide for building backends with CloudFlare Workers, D1 (SQL), KV (NoSQL), R2 (storage), and hybrid database strategies. Covers edge computing patterns, data modeling, performance optimization, and cost management for globally-distributed serverless applications.
---

# CloudFlare Backend Architect

**Version**: 1.0  
**Focus**: CloudFlare Workers + D1 + KV + R2 + Durable Objects  
**Purpose**: Build production-grade, globally-distributed serverless backends

---

## Core Philosophy: Edge-First Backend Architecture

### Traditional Backend vs Edge Backend

**Traditional (AWS Lambda, Google Cloud Functions)**:
- Code runs in specific regions (us-east-1, eu-west-1)
- Cold starts: 1-5 seconds
- Latency: 200-500ms for users far from region
- Scaling: Auto-scale within region

**CloudFlare Workers (Edge)**:
- Code runs in 300+ data centers worldwide
- Cold starts: <1ms (V8 isolates, not containers)
- Latency: <50ms globally (code executes near user)
- Scaling: Automatic, global distribution

**The Edge Paradigm Shift**: Don't ask "which region?" Ask "how do I design for global execution?"

---

## Part 1: CloudFlare Workers Deep Dive

### V8 Isolates vs Containers

**Why Workers are fast**:
- V8 isolates are lightweight JavaScript contexts
- Share same process, unlike containers
- Startup: Microseconds vs seconds
- Memory: MBs vs hundreds of MBs

**Constraints**:
- 10ms CPU time (free tier), 50ms (paid)
- 128MB memory limit
- No Node.js built-ins (`fs`, `net`, `child_process`)
- Must use Web Standard APIs

### Workers Request Lifecycle

```typescript
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // 1. Request comes to nearest CloudFlare data center
    // 2. Worker executes at that location
    // 3. Access env bindings (D1, KV, R2)
    // 4. Return response

    const url = new URL(request.url)
    
    // Route handling
    if (url.pathname === '/api/users') {
      return handleUsers(request, env)
    }
    
    return new Response('Not Found', { status: 404 })
  }
}
```

### Environment Bindings

Bindings connect Workers to CloudFlare resources:

```toml
# wrangler.toml
[[d1_databases]]
binding = "DB"  # Access via env.DB
database_name = "prod-db"
database_id = "xxx"

[[kv_namespaces]]
binding = "CACHE"  # Access via env.CACHE
id = "yyy"

[[r2_buckets]]
binding = "UPLOADS"  # Access via env.UPLOADS
bucket_name = "user-uploads"
```

Usage:
```typescript
const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first()
const session = await env.CACHE.get(`session:${sessionId}`)
const file = await env.UPLOADS.get('avatar.jpg')
```

---

## Part 2: D1 — SQL at the Edge

### Architecture & Design

**D1 is built on SQLite**:
- Standard SQL syntax
- Lightweight, embedded database
- ACID transactions
- File-based (but CloudFlare manages files)

**Global distribution**:
- **Primary instance**: Single source of truth (handles writes)
- **Read replicas**: Automatically created near high-traffic regions
- **Consistency**: Eventual (replicas sync within 60s)

### When to Use D1

✅ **Good for**:
- User accounts, profiles, authentication
- Content management (posts, products, lessons)
- Structured data with relationships (JOINs)
- Read-heavy workloads (10:1 read/write ratio)
- Per-user, per-tenant databases (horizontal scaling)

❌ **Bad for**:
- Write-heavy workloads (>100k writes/day per DB)
- Single large database (>10GB — use multiple DBs or Hyperdrive)
- Real-time data requiring strong consistency
- Analytics/time-series (use Analytics Engine)

### Data Modeling Patterns

#### Pattern 1: Per-User Database (Horizontal Scaling)

Instead of one massive database, create thousands of small databases:

```typescript
// Create database per user during signup
await createUserDatabase(userId)

// Route requests to user's database
const userDB = env[`USER_DB_${userId}`]
const data = await userDB.prepare('SELECT * FROM progress').all()
```

**Benefits**:
- Scales to millions of users
- Isolation (one user's data doesn't affect another)
- No single point of failure

**Use case**: SaaS applications, educational platforms with isolated user data

#### Pattern 2: Multi-Tenant with Tenant ID

Single database, partition by tenant:

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  email TEXT NOT NULL,
  UNIQUE(tenant_id, email)
);

CREATE INDEX idx_users_tenant ON users(tenant_id);
```

Always filter by `tenant_id`:
```typescript
const users = await env.DB.prepare(`
  SELECT * FROM users WHERE tenant_id = ?
`).bind(tenantId).all()
```

#### Pattern 3: Content + Metadata Split

Store large content in R2, metadata in D1:

```sql
CREATE TABLE articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  author_id INTEGER,
  content_url TEXT,  -- R2 URL
  created_at DATETIME
);
```

```typescript
// Fetch metadata from D1
const article = await env.DB.prepare('SELECT * FROM articles WHERE id = ?').bind(id).first()

// Fetch content from R2
const content = await env.UPLOADS.get(article.content_url)
```

### Performance Optimization

#### 1. Indexes

```sql
-- Before: Slow full table scan
SELECT * FROM users WHERE email = 'user@example.com';

-- After: Fast index lookup
CREATE INDEX idx_users_email ON users(email);
```

Always index columns used in `WHERE`, `JOIN`, `ORDER BY`.

#### 2. Prepared Statements (Prevents SQL Injection)

```typescript
// ❌ Vulnerable to SQL injection
const email = request.url.searchParams.get('email')
await env.DB.prepare(`SELECT * FROM users WHERE email = '${email}'`).all()

// ✅ Safe with parameterized query
await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).all()
```

#### 3. Batch Queries

```typescript
// ❌ Multiple round-trips
const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(1).first()
const posts = await env.DB.prepare('SELECT * FROM posts WHERE user_id = ?').bind(1).all()

// ✅ Single round-trip
const [userResult, postsResult] = await env.DB.batch([
  env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(1),
  env.DB.prepare('SELECT * FROM posts WHERE user_id = ?').bind(1)
])
```

#### 4. Pagination

```typescript
const PAGE_SIZE = 20

const offset = (page - 1) * PAGE_SIZE
const results = await env.DB.prepare(`
  SELECT * FROM posts
  ORDER BY created_at DESC
  LIMIT ? OFFSET ?
`).bind(PAGE_SIZE, offset).all()
```

---

## Part 3: KV — NoSQL Key-Value Store

### Architecture & Characteristics

**Eventually consistent**:
- Writes propagate globally in <60 seconds
- Reads are ultra-fast (500µs - 10ms for hot keys)
- Write limit: 1 write/second per unique key

**Caching layer**:
- Frequently accessed keys cached at edge
- Cache hit: <1ms
- Cache miss: ~10ms

### When to Use KV

✅ **Good for**:
- Session storage (auth tokens, user sessions)
- Configuration data (feature flags, API keys)
- Caching API responses
- Rate limiting counters
- Redirect mappings

❌ **Bad for**:
- Frequently updated data (>1 write/sec/key)
- Data requiring transactions
- Large values (>25MB limit, but <1MB recommended)
- Strong consistency requirements

### Data Patterns

#### Pattern 1: Session Storage

```typescript
// Store session on login
const sessionId = crypto.randomUUID()
const sessionData = {
  userId: user.id,
  email: user.email,
  exp: Date.now() + 7 * 24 * 60 * 60 * 1000  // 7 days
}

await env.CACHE.put(
  `session:${sessionId}`,
  JSON.stringify(sessionData),
  { expirationTtl: 7 * 24 * 60 * 60 }  // Auto-delete after 7 days
)

// Validate session on request
const session = await env.CACHE.get(`session:${sessionId}`, 'json')
if (!session || session.exp < Date.now()) {
  return new Response('Unauthorized', { status: 401 })
}
```

#### Pattern 2: Cache D1 Query Results

```typescript
async function getCachedUser(userId: string, env: Env) {
  const cacheKey = `user:${userId}`
  
  // 1. Check KV cache
  const cached = await env.CACHE.get(cacheKey, 'json')
  if (cached) return cached
  
  // 2. Query D1
  const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first()
  
  // 3. Cache in KV (5 minutes TTL)
  await env.CACHE.put(cacheKey, JSON.stringify(user), { expirationTtl: 300 })
  
  return user
}
```

#### Pattern 3: Feature Flags

```typescript
const features = await env.CACHE.get('feature:new_ui', 'json')

if (features?.enabled) {
  return renderNewUI()
} else {
  return renderOldUI()
}
```

Update feature flags globally:
```typescript
await env.CACHE.put('feature:new_ui', JSON.stringify({ enabled: true }))
// Propagates globally in <60s
```

#### Pattern 4: Rate Limiting

```typescript
async function rateLimit(ip: string, env: Env): Promise<boolean> {
  const key = `ratelimit:${ip}`
  const count = await env.CACHE.get(key, 'text')
  
  if (count && parseInt(count) > 100) {
    return false  // Rate limit exceeded
  }
  
  // Increment counter (expires in 1 hour)
  await env.CACHE.put(key, (parseInt(count || '0') + 1).toString(), { expirationTtl: 3600 })
  return true
}
```

### KV Metadata

Store metadata alongside values:
```typescript
await env.CACHE.put('key', 'value', {
  metadata: { version: 2, updatedBy: 'admin', tags: ['important'] }
})

const { value, metadata } = await env.CACHE.getWithMetadata('key')
```

---

## Part 4: Hybrid Database Strategy (D1 + KV)

### Decision Framework

| Data Type | Primary Storage | Cache Layer | Why |
|-----------|-----------------|-------------|-----|
| User accounts | D1 | KV (session) | Structured, relational |
| User progress | D1 | KV (current state) | Queryable, needs JOIN |
| Auth tokens | KV | — | Fast access, TTL support |
| Content (HTML/Markdown) | R2 | KV (metadata in D1) | Large, static |
| Configuration | KV | — | Read-heavy, global |
| Analytics | Analytics Engine | — | Time-series, aggregations |

### Real-World Example: Educational Platform

#### Schema Design

**D1 (Source of truth)**:
```sql
-- Users
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Lessons
CREATE TABLE lessons (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  track TEXT NOT NULL,
  difficulty INTEGER,
  content_key TEXT  -- R2 key
);

-- Progress (user-lesson relationship)
CREATE TABLE progress (
  user_id INTEGER,
  lesson_id TEXT,
  completed BOOLEAN DEFAULT 0,
  score INTEGER,
  completed_at DATETIME,
  PRIMARY KEY (user_id, lesson_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (lesson_id) REFERENCES lessons(id)
);

CREATE INDEX idx_progress_user ON progress(user_id);
```

**KV (Fast access)**:
```
Key: `session:{sessionId}`
Value: { userId, exp }

Key: `user:progress:{userId}`
Value: { completed: [...lessonIds], currentLevel: 3 }

Key: `lesson:content:{lessonId}`
Value: Lesson HTML (from R2, cached)
```

**R2 (Large content)**:
```
Key: `lessons/{lessonId}/content.html`
Key: `lessons/{lessonId}/assets/image.png`
```

#### Implementation

```typescript
// Get user progress (hybrid approach)
async function getUserProgress(userId: number, env: Env) {
  // 1. Try KV cache (fast)
  const cacheKey = `user:progress:${userId}`
  const cached = await env.CACHE.get(cacheKey, 'json')
  if (cached) return cached
  
  // 2. Query D1 (authoritative)
  const result = await env.DB.prepare(`
    SELECT 
      p.lesson_id,
      p.score,
      p.completed_at,
      l.title
    FROM progress p
    JOIN lessons l ON p.lesson_id = l.id
    WHERE p.user_id = ? AND p.completed = 1
    ORDER BY p.completed_at DESC
  `).bind(userId).all()
  
  const progress = {
    completed: result.results.map(r => r.lesson_id),
    lessons: result.results,
    currentLevel: calculateLevel(result.results.length)
  }
  
  // 3. Cache in KV (5 minutes)
  await env.CACHE.put(cacheKey, JSON.stringify(progress), { expirationTtl: 300 })
  
  return progress
}

// Get lesson content (multi-tier caching)
async function getLessonContent(lessonId: string, env: Env) {
  const cacheKey = `lesson:content:${lessonId}`
  
  // 1. Try KV cache
  const cached = await env.CACHE.get(cacheKey, 'text')
  if (cached) return cached
  
  // 2. Get metadata from D1
  const lesson = await env.DB.prepare('SELECT * FROM lessons WHERE id = ?').bind(lessonId).first()
  
  // 3. Fetch content from R2
  const content = await env.UPLOADS.get(`lessons/${lessonId}/content.html`)
  const html = await content.text()
  
  // 4. Cache in KV (1 hour)
  await env.CACHE.put(cacheKey, html, { expirationTtl: 3600 })
  
  return html
}
```

---

## Part 5: R2 — Object Storage

### Use Cases

- User-uploaded files (avatars, documents)
- Static assets (images, videos, PDFs)
- Database backups
- Large content (lesson materials, course videos)

### Benefits Over S3

- **No egress fees**: Free data transfer out
- **Global distribution**: Cached at edge
- **S3-compatible API**: Easy migration

### Implementation Patterns

#### Upload File

```typescript
async function uploadFile(request: Request, env: Env): Promise<Response> {
  const formData = await request.formData()
  const file = formData.get('file') as File
  
  const key = `uploads/${crypto.randomUUID()}-${file.name}`
  
  await env.UPLOADS.put(key, file.stream(), {
    httpMetadata: {
      contentType: file.type
    },
    customMetadata: {
      uploadedBy: userId,
      originalName: file.name
    }
  })
  
  return new Response(JSON.stringify({ key, url: `https://storage.example.com/${key}` }))
}
```

#### Serve File with Caching

```typescript
async function serveFile(key: string, env: Env): Promise<Response> {
  const object = await env.UPLOADS.get(key)
  
  if (!object) {
    return new Response('Not Found', { status: 404 })
  }
  
  return new Response(object.body, {
    headers: {
      'Content-Type': object.httpMetadata.contentType,
      'Cache-Control': 'public, max-age=3600',
      'ETag': object.etag
    }
  })
}
```

---

## Part 6: Advanced Patterns

### Pattern 1: Write-Through Cache

Update D1 and invalidate KV cache atomically:

```typescript
async function updateUser(userId: number, updates: Partial<User>, env: Env) {
  // 1. Update D1
  await env.DB.prepare(`
    UPDATE users SET email = ?, username = ? WHERE id = ?
  `).bind(updates.email, updates.username, userId).run()
  
  // 2. Invalidate KV cache
  await env.CACHE.delete(`user:${userId}`)
  
  // Next read will fetch fresh data from D1
}
```

### Pattern 2: Optimistic UI with Eventual Consistency

```typescript
async function likePost(postId: string, userId: number, env: Env) {
  // 1. Immediately update KV (fast, user sees instant feedback)
  const likesKey = `post:${postId}:likes`
  const likes = await env.CACHE.get(likesKey, 'text')
  await env.CACHE.put(likesKey, (parseInt(likes || '0') + 1).toString())
  
  // 2. Queue D1 update (background, eventual consistency OK)
  await env.DB.prepare(`
    INSERT INTO likes (post_id, user_id, created_at) VALUES (?, ?, ?)
  `).bind(postId, userId, new Date().toISOString()).run()
}
```

### Pattern 3: Multi-Region Writes with Conflict Resolution

```typescript
// Store write timestamp for conflict resolution
await env.DB.prepare(`
  UPDATE config SET value = ?, updated_at = ? WHERE key = ?
`).bind(newValue, Date.now(), configKey).run()

// On read, use latest timestamp (Last-Write-Wins)
```

---

## Part 7: Cost Optimization

### D1 Pricing

- **Free tier**: 5M reads + 100k writes per day
- **Paid**: $0.001 per 1,000 rows read, $1.00 per 1M rows written
- **Storage**: $0.75 per GB/month

**Optimization**:
- Cache reads in KV
- Batch queries
- Use indexes to minimize rows scanned

### KV Pricing

- **Free tier**: 100k reads + 1k writes per day
- **Paid**: $0.50 per 1M reads, $5.00 per 1M writes
- **Storage**: $0.50 per GB/month

**Optimization**:
- Set appropriate TTLs
- Use KV for read-heavy data only
- Delete stale keys

### Workers Pricing

- **Free tier**: 100k requests/day
- **Paid**: $5/month for 10M requests + $0.50 per 1M additional

**Optimization**:
- Cache responses at CDN level
- Use Durable Objects for coordination (reduce Worker invocations)

---

## Part 8: Testing & Development

### Local Development

```bash
# Start local dev server
npx wrangler dev

# Use local D1 database
npx wrangler d1 execute my-db --local --file=./schema.sql

# Test with local KV
npx wrangler dev --local
```

### Unit Testing

```typescript
// Use Miniflare for testing
import { Miniflare } from 'miniflare'

const mf = new Miniflare({
  script: 'export default { ... }',
  d1Databases: { DB: 'test-db' },
  kvNamespaces: { CACHE: 'test-kv' }
})

const res = await mf.dispatchFetch('http://localhost/api/users')
```

---

## Critical Reminders

1. **D1 is eventually consistent for reads**: Design for 60s propagation delay
2. **KV has 1 write/sec per key limit**: Don't use for frequently updated counters
3. **Workers have 10ms CPU limit (free tier)**: Offload heavy computation
4. **Use bindings, not fetch**: Direct access is faster than HTTP
5. **Batch D1 queries**: Reduce round-trips
6. **Cache aggressively in KV**: D1 queries are slower than KV reads
7. **Monitor costs**: D1 reads/writes add up quickly at scale

---

## Troubleshooting

### D1 Queries Timing Out
- Add indexes on WHERE/JOIN columns
- Paginate large result sets
- Use `.batch()` for multiple queries

### KV Writes Not Visible
- Remember eventual consistency (up to 60s)
- Use Durable Objects for strong consistency

### Workers CPU Time Exceeded
- Move heavy computation to Queues
- Batch operations
- Cache results in KV

---

## Resources

- **CloudFlare Workers**: https://developers.cloudflare.com/workers/
- **D1 Database**: https://developers.cloudflare.com/d1/
- **Workers KV**: https://developers.cloudflare.com/kv/
- **R2 Storage**: https://developers.cloudflare.com/r2/
- **Durable Objects**: https://developers.cloudflare.com/durable-objects/
