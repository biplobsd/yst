# Package Updates Guide

This document tracks package updates and provides guidance for maintaining dependencies.

## Available Update Commands

### Check for Updates
- `npm run outdated` - Show outdated packages
- `npm run update-check` - Show outdated packages and security audit

### Perform Updates
- `npm run update-safe` - Safe updates with security fixes
- `npm run update-minor` - Update to latest minor/patch versions
- `npm run update-interactive` - Interactive update selection
- `npm run update-major` - Update all packages to latest (use with caution)

## Recent Updates

### Last Updated: [Current Date]

**Successfully Updated Packages:**
- @crxjs/vite-plugin: 2.0.2 → 2.2.0
- @types/node: 22.16.0 → 22.17.2
- axios: 1.10.0 → 1.11.0
- pino: 9.7.0 → 9.9.0
- pino-pretty: 13.0.0 → 13.1.1
- prettier-plugin-tailwindcss: 0.6.13 → 0.6.14
- svelte: 5.35.1 → 5.38.2
- svelte-check: 4.2.2 → 4.3.1
- typescript: 5.8.3 → 5.9.2
- vite: 7.0.1 → 7.1.3
- zod: 3.25.71 → 3.25.76

**Packages Requiring Major Version Updates:**
- @sveltejs/vite-plugin-svelte: 6.0.0-next.1 → 6.1.3 (stable release available)
- @types/chrome: 0.0.328 → 0.1.4 (major version change)
- @types/node: 22.17.2 → 24.3.0 (major version change)
- daisyui: 4.12.24 → 5.0.50 (major version change)
- lucide-svelte: 0.525.0 → 0.540.0 (minor version update)
- tailwindcss: 3.4.17 → 4.1.12 (major version change - breaking changes expected)
- zod: 3.25.76 → 4.0.17 (major version change - breaking changes expected)

## Notes on Major Updates

### TailwindCSS 4.x
- Major rewrite with breaking changes
- Requires careful migration
- Test thoroughly before updating

### Zod 4.x  
- Breaking changes in API
- Check schema validation usage throughout codebase

### DaisyUI 5.x
- New features and potential breaking changes
- Review component usage after update

## Testing After Updates

Always perform these steps after package updates:

1. `npm run build` - Ensure project builds successfully
2. `npm run dev` - Test development mode
3. Test extension loading in Chrome/Firefox
4. Verify core functionality works

## Fixes Applied

### TypeScript Compatibility Issues
After updating packages, the following fixes were applied:

**src/utils/communication.ts:61**
```typescript
// Before
log.info("isOptionsPage", this.fromMsg, "Runtime Error: ");

// After  
log.info(`isOptionsPage ${this.fromMsg} Runtime Error: `);
```

**src/background/background.ts:75**
```typescript
// Before
log.info("oAuth2URL", oAuth2Url);

// After
log.info(`oAuth2URL: ${oAuth2Url}`);
```

These changes resolve Pino logger API compatibility issues that surfaced with newer package versions.