# Bickford App - Local Development Setup

## Quick Start (No Database Required)

The Bickford app works perfectly **without a database** for chat functionality.

```bash
# Set your OpenAI API key
export OPENAI_API_KEY="your-key-here"

# Start the app
npm run dev
```

Access at: http://localhost:3000/bickford

---

## Optional: Database Setup

Database is only needed for:
- AI patch logging
- Admin features
- License management

### Option 1: Skip Database (Recommended for Testing)

```bash
# App works without these commands
npm run dev
```

### Option 2: Use PostgreSQL

```bash
# Set database URL
export DATABASE_URL="postgresql://user:password@localhost:5432/bickford"

# Run migrations
npm run migrate:deploy

# Start app
npm run dev
```

### Option 3: Use SQLite (Development)

Edit `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

Then:

```bash
npx prisma migrate dev --name init
npm run dev
```

---

## Environment Variables

### Required
```bash
OPENAI_API_KEY=your-openai-key
```

### Optional
```bash
DATABASE_URL=postgresql://localhost:5432/bickford
GITHUB_TOKEN=your-github-token
STRIPE_SECRET_KEY=your-stripe-key
```

---

## Deployment

### Without Database (Minimal)
```bash
export OPENAI_API_KEY="your-key"
npm run build
npm start
```

### With Database (Full Features)
```bash
export OPENAI_API_KEY="your-key"
export DATABASE_URL="postgresql://..."
npm run migrate:deploy
npm run build
npm start
```

---

## Troubleshooting

### "DATABASE_URL resolved to an empty string"

**Solution:** Database is optional. Just skip the migrate command:

```bash
# Don't run: npm run migrate:deploy
# Just run: npm run dev
```

### "Prisma Client is not generated"

```bash
npx prisma generate
```

---

## What Works Without Database

✅ Bickford chat interface  
✅ Intent-to-reality processing  
✅ OPTR analysis  
✅ OpenAI integration  
✅ All core features  

## What Needs Database

❌ AI patch logging  
❌ Admin dashboard  
❌ License management  
❌ Usage analytics  

---

**For most use cases, you don't need a database!**