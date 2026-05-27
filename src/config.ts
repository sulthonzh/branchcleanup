import { Config } from './types';

export function loadConfig(): Config {
  return {
    staleThreshold: parseInt(process.env.BRANCHCLEANUP_STALE_THRESHOLD || '30'),
    protectedBranches: process.env.BRANCHCLEANUP_PROTECTED_BRANCHES 
      ? process.env.BRANCHCLEANUP_PROTECTED_BRANCHES.split(',')
      : ['main', 'master', 'develop', 'dev']
  };
}