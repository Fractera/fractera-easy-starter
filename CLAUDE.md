@AGENTS.md

## Production Server Structure

**Server IP:** 109.199.105.213  
**SSH:** `root` / `Julia711gc88`

**Deployment root:** `/opt/fractera/`

Three main services (managed by PM2):
- **fractera-app** → `/opt/fractera/app/` → port 3000 (Next.js)
  - Config: `.env.local` contains `NEXT_PUBLIC_MEDIA_URL` with subdomain
- **fractera-bridge** → `/opt/fractera/bridges/platforms/` → ports 3200-3206 (WebSocket)
- **fractera-media** → `/opt/fractera/services/media/` → port 3300 (Express, SQLite)

**To find current subdomain:**
```bash
grep NEXT_PUBLIC_MEDIA_URL /opt/fractera/app/.env.local
```
