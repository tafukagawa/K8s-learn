const KEY = 'github_pat'

export function getGithubToken(): string | null {
  return localStorage.getItem(KEY)
}

export function setGithubToken(token: string): void {
  localStorage.setItem(KEY, token)
}

export function clearGithubToken(): void {
  localStorage.removeItem(KEY)
}
