# Netlify Deployment Guide

This guide explains how to deploy the HVPE Cloud Portal (with Billy Mode Intent Panel) to Netlify.

## Prerequisites

- A Netlify account (https://netlify.com)
- Access to the repository on GitHub
- Required API keys and environment variables

## Environment Variables

The following environment variables must be configured in Netlify:

### Required

- `DATABASE_URL` - PostgreSQL connection string
  - Example: `postgresql://user:password@host:5432/dbname`
  - Used for: License management, AI usage logging, embeddings storage

- `LICENSE_SESSION_SECRET` - Secret key for session encryption
  - Example: `your-random-64-char-secret-key-here`
  - Used for: Session cookie signing and verification

- `OPENAI_API_KEY` or `HVPE_OPENAI_API_KEY` - OpenAI API key
  - Example: `sk-proj-...`
  - Used for: Intent analysis, AI chat, OPTR processing
  - Note: `HVPE_OPENAI_API_KEY` is preferred over `OPENAI_API_KEY`

### Optional

- `OPTR_OPENAI_KEY` - Alternative OpenAI key for OPTR features
- `ADMIN_DASH_TOKEN` - Admin dashboard authentication token
- `AI_WEBHOOK_SECRET` - Secret for AI webhook endpoints
- `STRIPE_SECRET_KEY` - Stripe payment processing (if using payments)
- `TWILIO_*` - Twilio credentials (if using SMS notifications)

## Netlify Build Settings

When setting up your Netlify site, use these settings:

### Build Command

```
npm run build
```

### Publish Directory

```
.next
```

### Base Directory

```
(leave empty or use root)
```

### Node Version

```
20
```

## Deployment Steps

### 1. Connect Repository to Netlify

1. Log in to Netlify
2. Click "Add new site" → "Import an existing project"
3. Choose "GitHub" as your Git provider
4. Select the `hvpe-cloud-portal` repository
5. Select the branch you want to deploy (e.g., `main` or `copilot/create-intent-panel-component`)

### 2. Configure Build Settings

1. Set **Build command** to: `npm run build`
2. Set **Publish directory** to: `.next`
3. Click "Show advanced" and add environment variable:
   - Key: `NODE_VERSION`
   - Value: `20`

### 3. Add Environment Variables

1. Go to **Site settings** → **Environment variables**
2. Add all required environment variables listed above
3. For sensitive values, use Netlify's "Sensitive" option to hide them

Example:

```
DATABASE_URL = postgresql://...
LICENSE_SESSION_SECRET = your-secret-here
HVPE_OPENAI_API_KEY = sk-proj-...
```

### 4. Install Netlify Next.js Plugin

The `netlify.toml` file already includes the Next.js plugin configuration.

If you need to install it manually:

```bash
npm install --save-dev @netlify/plugin-nextjs
```

### 5. Deploy

1. Click "Deploy site"
2. Netlify will:
   - Clone your repository
   - Install dependencies with `npm install`
   - Run database migrations (if `DATABASE_URL` is set)
   - Build the Next.js app with `npm run build`
   - Deploy to Netlify's CDN

### 6. Verify Deployment

After deployment completes:

1. Visit your Netlify site URL (e.g., `https://your-site.netlify.app`)
2. Navigate to `/t/billy` to access the Billy Mode page
3. Test the Intent Panel:
   - Type an intent like: "Show me drift severity and auto-rebalance when it exceeds 5%"
   - Click "Analyze Intent"
   - Verify the AI analysis appears
   - Click "Execute"
   - Verify progress updates stream in real-time

## Testing the Intent Panel

### Basic Test Flow

1. **Navigate to Billy Mode**
   - Go to: `https://your-site.netlify.app/t/billy`

2. **Enter an Intent**
   - Type in the Intent Panel: "Show me my portfolio positions"
   - Click "Analyze Intent"

3. **Review Analysis**
   - The AI should respond with a summary and action plan
   - Review the "why" explanations for each action
   - Click "Execute" to proceed

4. **Watch Real-Time Progress**
   - Progress updates should stream in real-time (no page refresh)
   - Status icons update as each step completes
   - Final "Done!" message appears when complete

### Test Intent Examples

Try these intents to test different scenarios:

- "Show me drift severity and auto-rebalance when it exceeds 5%"
- "Calculate my portfolio performance for the last 30 days"
- "Alert me when any position moves more than 3%"
- "Show me my top 5 performing stocks"
- "Enable paper trading mode with a $100k virtual balance"

## Troubleshooting

### Build Failures

**Issue**: `npm install` fails with dependency conflicts

- **Solution**: The build uses `--legacy-peer-deps` flag automatically via `netlify.toml`

**Issue**: `next: not found` error

- **Solution**: Ensure `next` is in `package.json` dependencies and `npm install` completed successfully

**Issue**: Prisma client errors

- **Solution**: Verify `DATABASE_URL` is set correctly and the database is accessible from Netlify

### Runtime Errors

**Issue**: Intent Panel shows "Analysis failed"

- **Solution**: Check that `OPENAI_API_KEY` or `HVPE_OPENAI_API_KEY` is set in Netlify environment variables
- **Solution**: Verify the API key is valid and has sufficient credits

**Issue**: SSE connection fails (no progress updates)

- **Solution**: Check Netlify function logs for errors
- **Solution**: Verify the `netlify.toml` headers configuration is correct

**Issue**: Session/authentication errors

- **Solution**: Verify `LICENSE_SESSION_SECRET` is set
- **Solution**: Clear browser cookies and try again

### Debugging

**View Function Logs**:

1. Go to Netlify dashboard
2. Click on your site
3. Go to "Functions" tab
4. Click on the failing function (e.g., `api/intent/analyze`)
5. View real-time logs

**View Build Logs**:

1. Go to Netlify dashboard
2. Click on your site
3. Go to "Deploys" tab
4. Click on the failed deploy
5. View full build logs

## Performance Considerations

### Cold Starts

Netlify serverless functions may experience "cold starts" (initial delay).

- **First request**: May take 1-3 seconds
- **Subsequent requests**: Typically < 500ms

To minimize cold starts:

- Use Netlify's "Keep Functions Warm" feature (paid plans)
- Consider using Netlify Edge Functions for critical paths

### API Rate Limits

OpenAI API has rate limits:

- **Free tier**: ~3 requests/minute
- **Paid tier**: Higher limits based on plan

To avoid hitting limits:

- Implement client-side debouncing for intent input
- Cache analysis results when possible
- Use lower-cost models (e.g., `gpt-4o-mini`) for non-critical features

## Custom Domain (Optional)

To use a custom domain:

1. Go to **Site settings** → **Domain management**
2. Click "Add custom domain"
3. Follow instructions to configure DNS
4. Netlify will automatically provision SSL/TLS certificates

## Continuous Deployment

Netlify automatically deploys when you push to the configured branch:

1. Push changes to GitHub:

   ```bash
   git push origin main
   ```

2. Netlify detects the push and triggers a build

3. After build completes, changes are live

To disable auto-deploy:

- Go to **Site settings** → **Build & deploy**
- Under "Continuous Deployment", click "Edit settings"
- Disable "Auto publishing"

## Support

For issues specific to:

- **Netlify deployment**: Contact Netlify support or check docs.netlify.com
- **Intent Panel features**: Review `/src/components/intent/IntentPanel.tsx` and API routes
- **LOCK system compliance**: Refer to `config/LOCK_SPEC.json` for constraints

## Next Steps

After successful deployment:

1. **Test all Intent Panel states**: idle, analyzing, proposed, executing, complete, error
2. **Monitor function logs**: Watch for errors or performance issues
3. **Set up monitoring**: Use Netlify Analytics or external monitoring tools
4. **Configure alerts**: Set up email/Slack notifications for build failures
5. **Document custom intents**: Create a list of supported intents for Billy Mode users

---

**Last Updated**: 2026-01-05  
**Netlify Plugin Version**: Latest (@netlify/plugin-nextjs)  
**Next.js Version**: 16.1.1  
**Node Version**: 20
