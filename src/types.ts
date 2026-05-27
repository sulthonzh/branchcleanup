export interface BranchInfo {
  name: string;
  type: 'merged' | 'squash-merged' | 'stale-30d' | 'stale-60d' | 'stale-90d' | 'active' | 'unknown';
  safeToDelete: boolean;
  lastCommit: string | null;
}

export interface CleanupOptions {
  dryRun: boolean;
  force: boolean;
  staleThreshold: number;
}

export interface Config {
  staleThreshold: number;
  protectedBranches: string[];
}