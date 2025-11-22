# Changelog

## 2025-10-11 - Authorization Added

### New Features
- ✅ API key authorization for public endpoints
- ✅ JWT tokens for administrative endpoints
- ✅ Login page with dark theme support
- ✅ Automatic redirect on token expiration
- ✅ Support for unauthorized access (view only)

### Fixes
- ✅ Audio playback with authorization via query parameter
- ✅ 401/403 error handling
- ✅ Automatic addition of authorization headers

### New Files
- `/src/services/auth.ts` - authorization service
- `/src/config/api.ts` - API configuration
- `/src/utils/audio.ts` - audio utilities
- `/src/composables/useAuth.ts` - authorization composable
- `/src/Components/Login.vue` - login page

### Updated Components
- `BaseLayout.vue` - authorization integration
- `BibleAnomalies.vue` - authorized audio support
- `BibleInspect.vue` - authorized audio support
- `ApiService` - automatic authorization headers

---

## Previous Versions

### Core Functionality
- Translation voice management
- Alignment anomaly handling
- Bible chapter inspector with audio
- MFA alignment tasks
- Dark theme
- Responsive design
