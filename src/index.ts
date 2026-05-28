#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { listBranches } from './branch-detector';
import { cleanupBranches } from './interactive';
import { loadConfig } from './config';

interface CommandOptions {
  staleThreshold?: string;
  dryRun?: boolean;
  force?: boolean;
}

interface Branch {
  name: string;
  type: 'merged' | 'squash-merged' | 'stale-30d' | 'stale-60d' | 'stale-90d' | 'active' | 'unknown';
  safeToDelete: boolean;
}

const program = new Command();
const config = loadConfig();

program
  .name('branchcleanup')
  .description('Smart Git branch cleanup CLI that detects squash-merged branches')
  .version('1.0.0');

program
  .command('list')
  .description('List branches with their status')
  .option('--stale-threshold <days>', 'Stale branch threshold in days', config.staleThreshold.toString())
  .action(async (options: CommandOptions) => {
    try {
      const branches = await listBranches(parseInt(options.staleThreshold || config.staleThreshold.toString()));
      displayBranchTable(branches);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error(chalk.red(`Error: ${errorMessage}`));
      process.exit(1);
    }
  });

program
  .command('cleanup')
  .description('Interactive branch cleanup')
  .option('--dry-run', 'Show what would be deleted without actually deleting', false)
  .option('--force', 'Bypass confirmation prompts', false)
  .option('--stale-threshold <days>', 'Stale branch threshold in days', config.staleThreshold.toString())
  .action(async (options: CommandOptions) => {
    try {
      await cleanupBranches({
        dryRun: options.dryRun || false,
        force: options.force || false,
        staleThreshold: parseInt(options.staleThreshold || config.staleThreshold.toString())
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error(chalk.red(`Error: ${errorMessage}`));
      process.exit(1);
    }
  });

program.parse();

function displayBranchTable(branches: Branch[]) {
  if (branches.length === 0) {
    console.log(chalk.yellow('No branches found to clean up.'));
    return;
  }

  console.log(chalk.bold('\n📋 Branch Status Report\n'));
  
  // Header
  console.log('┌────────────────────────────────┬──────────────────┬─────────────────────┐');
  console.log('│ Branch                        │ Type             │ Safe to Delete      │');
  console.log('├────────────────────────────────┼──────────────────┼─────────────────────┤');
  
  // Branch rows
  branches.forEach(branch => {
    const safeMark = branch.safeToDelete ? '✅ Yes' : '❌ No';
    const safeColor = branch.safeToDelete ? chalk.green(safeMark) : chalk.red(safeMark);
    const branchName = branch.name.padEnd(30);
    const type = branch.type.padEnd(16);
    
    console.log(`│ ${branchName}│ ${type}│ ${safeColor} │`);
  });
  
  console.log('└────────────────────────────────┴──────────────────┴─────────────────────┘');
  
  // Summary
  const deletable = branches.filter(b => b.safeToDelete);
  const stale = branches.filter(b => b.type.startsWith('stale-'));
  
  console.log(chalk.bold('\n📊 Summary:'));
  console.log(`Total branches: ${branches.length}`);
  console.log(`Safe to delete: ${deletable.length}`);
  console.log(`Stale branches: ${stale.length}`);
  
  if (deletable.length > 0) {
    console.log(chalk.green('\n💡 Run "branchcleanup cleanup" to delete safe branches'));
  }
}