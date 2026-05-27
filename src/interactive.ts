import simpleGit from 'simple-git';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { CleanupOptions } from './types';
import { listBranches } from './branch-detector';

export async function cleanupBranches(options: CleanupOptions): Promise<void> {
  const git = simpleGit();
  
  console.log(chalk.blue('🔍 Detecting branches to clean up...\n'));
  
  const branches = await listBranches(options.staleThreshold);
  const deletableBranches = branches.filter(b => b.safeToDelete);
  
  if (deletableBranches.length === 0) {
    console.log(chalk.yellow('No branches available for deletion.'));
    return;
  }
  
  if (options.dryRun) {
    console.log(chalk.bold('\n🔍 DRY RUN - What would be deleted:\n'));
    deletableBranches.forEach(branch => {
      console.log(chalk.red(`  ❌ ${branch.name} (${branch.type})`));
    });
    console.log(chalk.yellow('\n📝 No branches were actually deleted (dry run mode)'));
    return;
  }
  
  if (options.force) {
    console.log(chalk.bold('\n⚡ FORCE MODE - Deleting all safe branches:\n'));
    for (const branch of deletableBranches) {
      await deleteBranch(git, branch.name);
    }
    console.log(chalk.green(`✅ Deleted ${deletableBranches.length} branches`));
    return;
  }
  
  // Interactive mode
  console.log(chalk.bold('\n🎯 Interactive Branch Cleanup\n'));
  
  for (const branch of deletableBranches) {
    const answer = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'delete',
        message: `❓ Delete ${chalk.yellow(branch.name)} (${chalk.blue(branch.type)})?`,
        default: false
      }
    ]);
    
    if (answer.delete) {
      await deleteBranch(git, branch.name);
    } else {
      console.log(chalk.gray(`📝 Skipped ${branch.name} (user declined)`));
    }
  }
  
  console.log(chalk.green('\n✅ Cleanup completed!'));
}

async function deleteBranch(git: any, branchName: string): Promise<void> {
  try {
    await git.deleteLocalBranch(branchName);
    console.log(chalk.green(`✅ Deleted ${branchName}`));
  } catch (error: any) {
    console.log(chalk.red(`❌ Failed to delete ${branchName}: ${error.message}`));
    throw error;
  }
}