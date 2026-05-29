export interface BranchInfo {
  name: string;
  type: 'merged' | 'squash-merged' | `stale-${string}` | 'active' | 'unknown' | 'remote-merged' | 'remote-stale';
  safeToDelete: boolean;
  lastCommit: string | null;
  isRemote?: boolean;
}

export interface Branch {
  name: string;
  type: 'merged' | 'squash-merged' | 'stale';
  safeToDelete: boolean;
}

export interface CleanupOptions {
  dryRun: boolean;
  force: boolean;
  staleThreshold: number;
  includeRemote?: boolean;
}

export interface Config {
  staleThreshold: number;
  protectedBranches: string[];
}