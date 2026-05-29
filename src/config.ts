import { Config } from './types';

export function loadConfig(): Config {
  try {
    const staleThreshold = parseInt(process.env.BRANCHCLEANUP_STALE_THRESHOLD || '30');
    
    if (isNaN(staleThreshold) || staleThreshold < 1) {
      console.warn('Invalid stale threshold, using default (30 days)');
      return {
        staleThreshold: 30,
        protectedBranches: ['main', 'master', 'develop', 'dev']
      };
    }
    
    const protectedBranches = process.env.BRANCHCLEANUP_PROTECTED_BRANCHES 
      ? process.env.BRANCHCLEANUP_PROTECTED_BRANCHES.split(',').map(b => b.trim()).filter(Boolean)
      : ['main', 'master', 'develop', 'dev'];
    
    return {
      staleThreshold,
      protectedBranches
    };
  } catch (error) {
    console.warn('Error loading config, using defaults:', error);
    return {
      staleThreshold: 30,
      protectedBranches: ['main', 'master', 'develop', 'dev']
    };
  }
}