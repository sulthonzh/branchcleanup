import { cleanupBranches } from '../src/interactive';

// Mock dependencies
jest.mock('simple-git');
jest.mock('../src/branch-detector');
jest.mock('inquirer');

const mockedSimpleGit = require('simple-git');
const mockedListBranches = require('../src/branch-detector').listBranches;
const mockedInquirer = require('inquirer');

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
      { name: 'feature/test', type: 'merged', safeToDelete: true }
    ]);

    await cleanupBranches({
      dryRun: true,
      force: false,
      staleThreshold: 30
    });

    // Check if the dry run message was logged
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('DRY RUN - What would be deleted')
    );
  });

  test('should handle force mode', async () => {
    const mockDeleteBranch = jest.fn().mockResolvedValue(undefined);
    mockedSimpleGit.mockReturnValue({
      deleteLocalBranch: mockDeleteBranch
    });

    mockedListBranches.mockResolvedValue([
      { name: 'feature/test', type: 'merged', safeToDelete: true }
    ]);

    await cleanupBranches({
      dryRun: false,
      force: true,
      staleThreshold: 30
    });

    expect(mockDeleteBranch).toHaveBeenCalledWith('feature/test');
  });

  test('should handle interactive mode', async () => {
    const mockDeleteBranch = jest.fn().mockResolvedValue(undefined);
    mockedSimpleGit.mockReturnValue({
      deleteLocalBranch: mockDeleteBranch
    });

    mockedListBranches.mockResolvedValue([
      { name: 'feature/test', type: 'merged', safeToDelete: true }
    ]);

    mockedInquirer.prompt.mockResolvedValue({
      delete: true
    });

    await cleanupBranches({
      dryRun: false,
      force: false,
      staleThreshold: 30
    });

    expect(mockDeleteBranch).toHaveBeenCalledWith('feature/test');
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
});