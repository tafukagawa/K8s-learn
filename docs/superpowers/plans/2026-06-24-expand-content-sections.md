# Expand Content Sections Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 17 new sections across the 5 existing tools so the `generate-content.yml` Actions workflow can generate knowledge and commands for them automatically.

**Architecture:** Two purely additive changes: (1) create `meta.json` for each new section directory so the app recognises the sections, and (2) add corresponding `Source` entries to `generate-content.ts` so the workflow fetches and generates content. No app code changes — content generation runs via GitHub Actions.

**Tech Stack:** JSON (meta.json), TypeScript (generate-content.ts SOURCES array)

---

## File Map

| File | Action |
|---|---|
| `categories/k8s/sections/07-rbac/meta.json` | Create |
| `categories/k8s/sections/08-statefulset-daemonset/meta.json` | Create |
| `categories/k8s/sections/09-jobs-cronjobs/meta.json` | Create |
| `categories/k8s/sections/10-ingress-networkpolicy/meta.json` | Create |
| `categories/k8s/sections/11-resource-management/meta.json` | Create |
| `categories/k8s/sections/12-namespace-context/meta.json` | Create |
| `categories/docker/sections/05-dockerfile/meta.json` | Create |
| `categories/docker/sections/06-build/meta.json` | Create |
| `categories/docker/sections/07-registry/meta.json` | Create |
| `categories/helm/sections/05-dependencies/meta.json` | Create |
| `categories/helm/sections/06-hooks/meta.json` | Create |
| `categories/helm/sections/07-test/meta.json` | Create |
| `categories/argocd/sections/04-cli-reference/meta.json` | Create |
| `categories/argocd/sections/05-applicationset/meta.json` | Create |
| `categories/argocd/sections/06-notifications/meta.json` | Create |
| `categories/kustomize/sections/04-patches/meta.json` | Create |
| `categories/kustomize/sections/05-components/meta.json` | Create |
| `.github/scripts/generate-content.ts` | Modify — append 17 entries to SOURCES |

---

### Task 1: Create k8s section meta.json files (6 files)

**Files:** Create 6 meta.json files under `categories/k8s/sections/`

- [ ] **Step 1: Create `categories/k8s/sections/07-rbac/meta.json`**
```json
{ "title": "RBAC・ServiceAccount" }
```

- [ ] **Step 2: Create `categories/k8s/sections/08-statefulset-daemonset/meta.json`**
```json
{ "title": "StatefulSet・DaemonSet" }
```

- [ ] **Step 3: Create `categories/k8s/sections/09-jobs-cronjobs/meta.json`**
```json
{ "title": "Job・CronJob" }
```

- [ ] **Step 4: Create `categories/k8s/sections/10-ingress-networkpolicy/meta.json`**
```json
{ "title": "Ingress・NetworkPolicy" }
```

- [ ] **Step 5: Create `categories/k8s/sections/11-resource-management/meta.json`**
```json
{ "title": "リソース管理" }
```

- [ ] **Step 6: Create `categories/k8s/sections/12-namespace-context/meta.json`**
```json
{ "title": "Namespace・コンテキスト" }
```

- [ ] **Step 7: Commit**
```bash
git add categories/k8s/sections/
git commit -m "feat: add k8s sections 07-12 for expanded content generation"
```

---

### Task 2: Create docker, helm, argocd, kustomize section meta.json files (11 files)

**Files:** Create 11 meta.json files

- [ ] **Step 1: Create docker sections**

`categories/docker/sections/05-dockerfile/meta.json`:
```json
{ "title": "Dockerfile" }
```

`categories/docker/sections/06-build/meta.json`:
```json
{ "title": "ビルド・BuildKit" }
```

`categories/docker/sections/07-registry/meta.json`:
```json
{ "title": "レジストリ操作" }
```

- [ ] **Step 2: Create helm sections**

`categories/helm/sections/05-dependencies/meta.json`:
```json
{ "title": "依存管理" }
```

`categories/helm/sections/06-hooks/meta.json`:
```json
{ "title": "Helmフック" }
```

`categories/helm/sections/07-test/meta.json`:
```json
{ "title": "テスト・Lint" }
```

- [ ] **Step 3: Create argocd sections**

`categories/argocd/sections/04-cli-reference/meta.json`:
```json
{ "title": "CLIリファレンス" }
```

`categories/argocd/sections/05-applicationset/meta.json`:
```json
{ "title": "ApplicationSet" }
```

`categories/argocd/sections/06-notifications/meta.json`:
```json
{ "title": "通知" }
```

- [ ] **Step 4: Create kustomize sections**

`categories/kustomize/sections/04-patches/meta.json`:
```json
{ "title": "パッチ" }
```

`categories/kustomize/sections/05-components/meta.json`:
```json
{ "title": "コンポーネント" }
```

- [ ] **Step 5: Commit**
```bash
git add categories/docker/sections/ categories/helm/sections/ categories/argocd/sections/ categories/kustomize/sections/
git commit -m "feat: add docker/helm/argocd/kustomize sections for expanded content generation"
```

---

### Task 3: Update generate-content.ts SOURCES array

**Files:**
- Modify: `.github/scripts/generate-content.ts`

- [ ] **Step 1: Read the file to locate the SOURCES array end**

The current SOURCES array ends at the kustomize entries (around line 55). Append these 17 new entries inside the array, before the closing `]`:

```ts
  // k8s 追加セクション
  { category: 'k8s', section: '07-rbac',                  url: 'https://kubernetes.io/docs/reference/access-authn-authz/rbac/',                                          type: 'both' },
  { category: 'k8s', section: '08-statefulset-daemonset',  url: 'https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/',                                  type: 'both' },
  { category: 'k8s', section: '09-jobs-cronjobs',          url: 'https://kubernetes.io/docs/concepts/workloads/controllers/job/',                                          type: 'both' },
  { category: 'k8s', section: '10-ingress-networkpolicy',  url: 'https://kubernetes.io/docs/concepts/services-networking/ingress/',                                        type: 'both' },
  { category: 'k8s', section: '11-resource-management',    url: 'https://kubernetes.io/docs/concepts/policy/resource-quotas/',                                             type: 'both' },
  { category: 'k8s', section: '12-namespace-context',      url: 'https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/',                           type: 'both' },
  // docker 追加セクション
  { category: 'docker', section: '05-dockerfile',          url: 'https://docs.docker.com/reference/dockerfile/',                                                           type: 'knowledge' },
  { category: 'docker', section: '06-build',               url: 'https://docs.docker.com/reference/cli/docker/buildx/build/',                                             type: 'commands' },
  { category: 'docker', section: '07-registry',            url: 'https://docs.docker.com/reference/cli/docker/image/push/',                                               type: 'commands' },
  // helm 追加セクション
  { category: 'helm', section: '05-dependencies',          url: 'https://helm.sh/docs/helm/helm_dependency/',                                                             type: 'both' },
  { category: 'helm', section: '06-hooks',                 url: 'https://helm.sh/docs/topics/charts_hooks/',                                                              type: 'knowledge' },
  { category: 'helm', section: '07-test',                  url: 'https://helm.sh/docs/helm/helm_test/',                                                                   type: 'commands' },
  // argocd 追加セクション
  { category: 'argocd', section: '04-cli-reference',       url: 'https://argo-cd.readthedocs.io/en/stable/user-guide/commands/argocd/',                                   type: 'commands' },
  { category: 'argocd', section: '05-applicationset',      url: 'https://argo-cd.readthedocs.io/en/stable/user-guide/application-set/',                                   type: 'both' },
  { category: 'argocd', section: '06-notifications',       url: 'https://argo-cd.readthedocs.io/en/stable/operator-manual/notifications/',                                type: 'knowledge' },
  // kustomize 追加セクション
  { category: 'kustomize', section: '04-patches',          url: 'https://kubectl.docs.kubernetes.io/references/kustomize/kustomization/patches/',                          type: 'both' },
  { category: 'kustomize', section: '05-components',       url: 'https://kubectl.docs.kubernetes.io/references/kustomize/kustomization/components/',                       type: 'both' },
```

- [ ] **Step 2: Commit**
```bash
git add .github/scripts/generate-content.ts
git commit -m "feat: add 17 new sources to content generation script"
```

---

### Task 4: Push and trigger workflow

- [ ] **Step 1: Push to main**
```bash
git push origin main
```

- [ ] **Step 2: Trigger workflow manually**

GitHub Actions → `Generate Content` → `Run workflow` で手動実行して動作確認する。
