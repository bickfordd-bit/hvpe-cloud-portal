# Bickford Instance Configuration Guide

## Complete UI Control for Every Instance

This guide shows you how to customize **every aspect** of your Bickford instance while maintaining customer privacy compliance.

---

## Quick Start

### 1. Basic Configuration

Create a `bickford.config.json` file:

```json
{
  "branding": {
    "appName": "Your App Name",
    "tagline": "Your Tagline",
    "primaryColor": "#9333ea",
    "accentColor": "#ec4899"
  },
  "header": {
    "show": true,
    "title": "Your App",
    "subtitle": "Your Subtitle"
  },
  "privacy": {
    "collectAnalytics": false,
    "storeConversations": false,
    "dataRetentionDays": 30
  }
}
```

### 2. Apply Configuration

```bash
# Set via environment variable
export BICKFORD_CONFIG='{"branding":{"appName":"Custom"}}'

# Or load from file
export BICKFORD_CONFIG_FILE=./bickford.config.json
```

### 3. Deploy

```bash
npm run build
npm start
```

---

## Configuration Options

### Branding

```json
{
  "branding": {
    "appName": "Your Brand Name",
    "tagline": "Your Tagline Here",
    "logo": "/path/to/logo.png",
    "favicon": "/path/to/favicon.ico",
    "primaryColor": "#HEX_COLOR",
    "accentColor": "#HEX_COLOR"
  }
}
```

**Colors:**
- Use any hex color code
- Primary: Main brand color
- Accent: Buttons, highlights, CTAs

**Logo:**
- PNG/SVG recommended
- Max size: 200x60px
- Transparent background preferred

---

### Header Configuration

```json
{
  "header": {
    "show": true,
    "title": "Custom Title",
    "subtitle": "Optional Subtitle",
    "showPoweredBy": false,
    "customHTML": "<div>Custom HTML</div>"
  }
}
```

**Options:**
- `show`: true/false - Show/hide entire header
- `showPoweredBy`: true/false - Show "Powered by Bickford" (white-label option)
- `customHTML`: Inject custom HTML in header

---

### Chat Interface

```json
{
  "chat": {
    "placeholder": "Custom placeholder text...",
    "welcomeMessage": "Custom welcome message",
    "buttonText": "Send / Manifest / Submit",
    "showTimestamps": true,
    "maxMessageLength": 2000,
    "enableVoice": false,
    "enableFileUpload": false
  }
}
```

**Features:**
- Custom placeholder and welcome message
- Configurable message length (100-10000)
- Voice input (coming soon)
- File upload for documents

---

### Features Control

```json
{
  "features": {
    "enableOPTR": true,
    "enableIntentToReality": true,
    "enableIPProtection": true,
    "showMetrics": true,
    "showFormulaVersion": false
  }
}
```

**Features:**
- `enableOPTR`: Opportunity analysis
- `enableIntentToReality`: Core intent processing
- `enableIPProtection`: Patent protection features
- `showMetrics`: Display acceleration metrics
- `showFormulaVersion`: Show formula version (keep false for security)

---

### Privacy & Data Control

```json
{
  "privacy": {
    "collectAnalytics": false,
    "storeConversations": false,
    "dataRetentionDays": 30,
    "showPrivacyNotice": true,
    "allowDataExport": true,
    "allowDataDeletion": true,
    "encryptData": true
  }
}
```

**Privacy Levels:**

**Level 1 - Minimal (Default):**
```json
{
  "collectAnalytics": false,
  "storeConversations": false,
  "dataRetentionDays": 0
}
```
- No tracking
- No storage
- Complete anonymity
- Session-only memory

**Level 2 - Standard:**
```json
{
  "collectAnalytics": true,
  "storeConversations": true,
  "dataRetentionDays": 30
}
```
- Anonymous analytics
- 30-day retention
- User consent required
- Export/delete enabled

**Level 3 - Enterprise:**
```json
{
  "collectAnalytics": true,
  "storeConversations": true,
  "dataRetentionDays": 365
}
```
- Full audit trail
- Long retention
- Compliance logging
- Advanced controls

---

### Footer Configuration

```json
{
  "footer": {
    "show": true,
    "copyright": "© 2025 Your Company",
    "links": [
      { "text": "Privacy", "url": "/privacy" },
      { "text": "Terms", "url": "/terms" }
    ],
    "customHTML": "<div>Custom footer content</div>"
  }
}
```

---

### Advanced Configuration

```json
{
  "advanced": {
    "customCSS": ".bickford-app { font-family: 'Custom Font'; }",
    "customJS": "console.log('Custom JS loaded');",
    "apiEndpoint": "https://custom-api.example.com",
    "rateLimit": 100,
    "enableDebug": false
  }
}
```

**Custom CSS:**
- Override any styles
- Brand-specific design
- Responsive adjustments

**Custom JS:**
- Add tracking scripts
- Custom functionality
- Third-party integrations

**API Endpoint:**
- Use custom backend
- Self-hosted processing
- Hybrid deployments

---

## Privacy Compliance

### GDPR Compliance

For EU users, enable these settings:

```json
{
  "privacy": {
    "showPrivacyNotice": true,
    "allowDataExport": true,
    "allowDataDeletion": true,
    "dataRetentionDays": 30,
    "collectAnalytics": false
  }
}
```

**Required:**
- ✅ Privacy notice on first use
- ✅ Consent before data collection
- ✅ Data export functionality
- ✅ Data deletion on request
- ✅ Clear retention policy

### CCPA Compliance

For California users:

```json
{
  "privacy": {
    "allowDataExport": true,
    "allowDataDeletion": true,
    "doNotSell": true
  }
}
```

**Required:**
- ✅ "Do Not Sell My Data" option
- ✅ Data disclosure
- ✅ Deletion rights
- ✅ Non-discrimination

### HIPAA Compliance

For healthcare applications:

```json
{
  "privacy": {
    "encryptData": true,
    "storeConversations": false,
    "dataRetentionDays": 0,
    "enableDebug": false
  }
}
```

**Required:**
- ✅ End-to-end encryption
- ✅ No persistent storage
- ✅ Audit logging
- ✅ Business Associate Agreement (BAA)

---

## White-Label Configuration

Complete white-label deployment:

```json
{
  "branding": {
    "appName": "YourCompany AI",
    "tagline": "Your Custom Tagline",
    "logo": "/your-logo.png",
    "primaryColor": "#YOUR_COLOR",
    "accentColor": "#YOUR_ACCENT"
  },
  "header": {
    "showPoweredBy": false
  },
  "footer": {
    "copyright": "© 2025 Your Company",
    "links": [
      { "text": "Your Privacy Policy", "url": "/privacy" },
      { "text": "Your Terms", "url": "/terms" }
    ]
  },
  "advanced": {
    "customCSS": "/* Your brand styles */",
    "apiEndpoint": "https://your-api.com"
  }
}
```

**Result:**
- ✅ Your branding everywhere
- ✅ No Bickford references
- ✅ Your domain
- ✅ Your support
- ✅ Your legal docs

---

## Multi-Instance Setup

Run multiple instances with different configs:

```bash
# Instance 1: Public
BICKFORD_CONFIG_FILE=./config/public.json npm start

# Instance 2: Enterprise
BICKFORD_CONFIG_FILE=./config/enterprise.json npm start

# Instance 3: Healthcare
BICKFORD_CONFIG_FILE=./config/healthcare.json npm start
```

**Use Cases:**
- Different customers
- Different compliance levels
- Different features
- Different branding

---

## Real-Time Configuration

Change config without redeployment:

```typescript
// Admin API endpoint
POST /api/admin/config
{
  "branding": {
    "appName": "New Name"
  }
}

// Changes apply immediately
// No server restart needed
```

**Admin Dashboard:**
```bash
# Access at /admin/config
Username: admin
Password: [Set via ADMIN_PASSWORD env var]
```

---

## Configuration Templates

### Template 1: Minimal Privacy
```json
{
  "privacy": {
    "collectAnalytics": false,
    "storeConversations": false,
    "dataRetentionDays": 0
  }
}
```

### Template 2: Standard Business
```json
{
  "privacy": {
    "collectAnalytics": true,
    "storeConversations": true,
    "dataRetentionDays": 90
  }
}
```

### Template 3: Enterprise
```json
{
  "privacy": {
    "collectAnalytics": true,
    "storeConversations": true,
    "dataRetentionDays": 365,
    "auditLogging": true
  }
}
```

---

## Testing Configuration

```bash
# Validate config
npm run validate-config -- ./config.json

# Test locally
npm run dev -- --config ./config.json

# Preview changes
npm run preview-config -- ./config.json
```

---

## Customer Privacy Rules Summary

✅ **You Control Everything**  
✅ **Change Anytime**  
✅ **No Code Required**  
✅ **Instant Updates**  
✅ **Full Compliance**  
✅ **Documentation Included**  
✅ **Support Available**  

---

## Support

Configuration help:
- 📧 config@bickfordtechnologies.com
- 📚 docs.bickfordtechnologies.com
- 💬 support chat in app

Privacy compliance:
- 📧 privacy@bickfordtechnologies.com
- 📄 Full privacy policy included
- 🔒 Security audit available

---

**You have complete control. Configure your instance however you need, while we ensure customer privacy is always protected.**