import simpleGit, { SimpleGit } from 'simple-git';
import { BranchInfo } from './types';

export async function listBranches(staleThreshold: number = 30, includeRemote: boolean = false): Promise<BranchInfo[]> {
  const git = simpleGit();
  
  // Get current branch
  const currentBranch = await git.branchLocal();
  const currentBranchName = currentBranch.current;
  
  // Get all branches
  const allBranches = includeRemote ? await git.branch() : await git.branchLocal();
  
  // Get merged branches
  const mergedBranches = await git.branch(['--merged']);
  const mergedBranchNames = mergedBranches.all
    .map(b => b.replace(/^\*?\s*/, ''))
    .filter(b => !includeRemote || !b.includes('/')); // Filter out remote branches if not included
  
  // Get commit hashes for squash detection
  const mainBranch = currentBranchName === 'main' ? 'main' : 
                     currentBranchName === 'master' ? 'master' : 'main';
  const mainCommits = await git.raw(['rev-list', mainBranch]);
  const mainCommitHashes = mainCommits.trim().split('\n').filter(Boolean);
  
  const branches: BranchInfo[] = [];
  
  for (const branch of allBranches.all) {
    const branchName = branch.replace(/^\*?\s*/, '');
    
    // Skip current branch
    if (branchName === currentBranchName) continue;
    
    // Skip protected branches
    if (isProtectedBranch(branchName)) continue;
    
    const branchInfo: BranchInfo = {
      name: branchName,
      type: 'unknown',
      safeToDelete: false,
      lastCommit: null
    };
    
    // Check if branch is merged (regular merge)
    const isRegularMerged = mergedBranchNames.includes(branchName);
    
    // Check if branch is squash-merged
    const isSquashMergedResult = await isSquashMerged(git, branchName, mainCommitHashes);
    
    // Check if branch is stale
    const isStale = await isBranchStale(git, branchName, staleThreshold);
    
    // Determine branch type and safety
    if (isRegularMerged) {
      branchInfo.type = 'merged';
      branchInfo.safeToDelete = true;
    } else if (isSquashMergedResult) {
      branchInfo.type = 'squash-merged';
      branchInfo.safeToDelete = true;
    } else if (isStale) {
      branchInfo.type = `stale-${staleThreshold}d`;
      branchInfo.safeToDelete = true; // Stale branches are safe to delete by default
    } else {
      branchInfo.type = 'active';
      branchInfo.safeToDelete = false;
    }
    
    // Get last commit info
    try {
      const log = await git.log([`--oneline`, `--max-count=1`, branchName]);
      branchInfo.lastCommit = log.latest?.date || null;
    } catch (error) {
      // Ignore errors getting commit info
    }
    
    branches.push(branchInfo);
  }
  
  return branches.sort((a, b) => {
    // Sort by safety first, then by name
    if (a.safeToDelete !== b.safeToDelete) {
      return b.safeToDelete ? 1 : -1;
    }
    return a.name.localeCompare(b.name);
  });
}

async function isSquashMerged(git: SimpleGit, branchName: string, mainCommitHashes: string[]): Promise<boolean> {
  try {
    // Get commits from the branch
    const branchCommits = await git.raw(['rev-list', branchName]);
    const branchCommitHashes = branchCommits.trim().split('\n').filter(Boolean);
    
    // Check if all branch commits exist in main branch
    const allCommitsExist = branchCommitHashes.every(hash => 
      mainCommitHashes.some(mainHash => mainHash.startsWith(hash))
    );
    
    return allCommitsExist;
  } catch (error) {
    return false;
  }
}

async function isBranchStale(git: SimpleGit, branchName: string, thresholdDays: number): Promise<boolean> {
  try {
    const log = await git.log([`--since=${thresholdDays} days ago`, branchName]);
    return log.total === 0;
  } catch (error) {
    // If we can't get log info, assume it's not stale to be safe
    return false;
  }
}

function isProtectedBranch(branchName: string): boolean {
  const protectedBranches = ['main', 'master', 'develop', 'dev', 'production'];
  return protectedBranches.includes(branchName);
}