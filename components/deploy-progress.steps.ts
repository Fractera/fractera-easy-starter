export type Step = { id: string; label: string; done: boolean; skipped?: boolean }

// Pipeline shown in the install-progress UI. Order matches actual emission
// sequence from /api/install + lib/deploy.ts + lib/bootstrap.sh + /api/progress.
// Verified against bootstrap.sh emitters on 2026-05-29 (post-Cloudflare,
// IP-only deploys — no DNS / SSL / cert provisioning steps).
export const ALL_STEPS: Step[] = [
  // /api/install
  { id: 'email_start',          label: 'Confirmation email sent',                  done: false },
  { id: 'wipe_start',           label: 'Cleaning previous installation',           done: false },
  // lib/deploy.ts (after SSH ready)
  { id: 'connect',              label: 'Connecting to server',                     done: false },
  // bootstrap.sh
  { id: 'apt_update',           label: 'Updating system',                          done: false },
  { id: 'apt_install',          label: 'Installing base tools',                    done: false },
  { id: 'node_repo',            label: 'Adding Node.js repository',                done: false },
  { id: 'node_install',         label: 'Installing Node.js 20',                    done: false },
  { id: 'pm2',                  label: 'Installing PM2 process manager',           done: false },
  { id: 'clear_creds',          label: 'Clearing platform credentials',            done: false },
  { id: 'register',             label: 'Detecting server IP',                      done: false },
  { id: 'clone',                label: 'Downloading Fractera',                     done: false },
  { id: 'deps_root',            label: 'Installing dependencies (1/6)',            done: false },
  { id: 'deps_app',             label: 'Installing dependencies (2/6)',            done: false },
  { id: 'deps_app_native',      label: 'Installing native modules',                done: false },
  { id: 'deps_bridge',          label: 'Installing dependencies (3/6)',            done: false },
  { id: 'deps_auth',            label: 'Installing dependencies (4/6)',            done: false },
  { id: 'deps_bridges_app',     label: 'Installing dependencies (5/6)',            done: false },
  { id: 'deps_data',            label: 'Installing dependencies (6/6)',            done: false },
  { id: 'install_claude',         label: 'Claude Code',                            done: false },
  { id: 'install_codex',         label: 'Codex',                                   done: false },
  { id: 'install_gemini',        label: 'Gemini CLI',                              done: false },
  { id: 'install_qwen',          label: 'Qwen Code',                               done: false },
  { id: 'install_kimi',          label: 'Kimi Code',                               done: false },
  { id: 'install_lightrag',      label: 'LightRAG (Company Brain)',                done: false },
  { id: 'build_lightrag_webui',  label: 'Building Company Brain UI',               done: false },
  { id: 'install_hermes',        label: 'Hermes Agent',                            done: false },
  { id: 'install_hermes_plugins',label: 'Hermes memory plugins',                  done: false },
  { id: 'install_hermes_skills', label: 'Hermes delegation skills',               done: false },
  { id: 'install_hermes_theme',  label: 'Hermes dashboard theme',                 done: false },
  { id: 'hermes_docs_dir',       label: 'Hermes protected docs dir',              done: false },
  { id: 'prepare_secrets',       label: 'Generating security keys',                done: false },
  { id: 'prepare_env',          label: 'Writing environment configuration',        done: false },
  { id: 'build_app',            label: 'Building shell (production)',              done: false },
  { id: 'build_auth',           label: 'Building auth service',                    done: false },
  { id: 'build_bridges_app',    label: 'Building admin service',                   done: false },
  { id: 'start_app',            label: 'Starting shell service',                   done: false },
  { id: 'start_bridge',         label: 'Starting bridge service',                  done: false },
  { id: 'start_auth',           label: 'Starting auth service',                    done: false },
  { id: 'start_admin',          label: 'Starting admin service',                   done: false },
  { id: 'start_data',           label: 'Starting data service',                    done: false },
  { id: 'start_rag',            label: 'LightRAG service',                         done: false },
  { id: 'start_hermes',         label: 'Hermes Agent service',                     done: false },
  { id: 'pm2_save',             label: 'Saving configuration',                     done: false },
  { id: 'configure_nginx_http', label: 'Configuring web server (HTTP)',            done: false },
  { id: 'health_check',         label: 'Verifying server is responding',           done: false },
  // /api/progress (on bootstrap done=true)
  { id: 'email_complete',       label: 'Welcome email with URLs sent',            done: false },
]
