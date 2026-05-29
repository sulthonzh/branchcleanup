import { cleanupBranches } from '../src/interactive';

// Mock dependencies
jest.mock('simple-git');
jest.mock('../src/branch-detector');
jest.mock('inquirer');

const mockedListBranches = require('../src/branch-detector').listBranches;

describe('Interactive Cleanup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console.log
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should handle dry run mode', async () => {
    mockedListBranches.mockResolvedValue([
      { name: 'feature/test', type: 'merged', safeToDelete: true, lastCommit: null }
    ]);

    await cleanupBranches({
      dryRun: true,
      force: false,
      staleThreshold: 30
    });

    // Check if the dry run message was logged
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('DRY RUN')
    );
  });

  test('should handle no deletable branches', async () => {
    mockedListBranches.mockResolvedValue([]);

    await cleanupBranches({
      dryRun: false,
      force: false,
      staleThreshold: 30
    });

    // Check if the no branches message was logged
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('No branches available for deletion')
    );
  });

  test('should handle empty branch list gracefully', async () => {
    mockedListBranches.mockResolvedValue([]);

    await cleanupBranches({
      dryRun: false,
      force: false,
      staleThreshold: 30
    });

    // Should not throw any errors
    expect(true).toBe(true);
  });
});