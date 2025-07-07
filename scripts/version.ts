import { execSync } from 'node:child_process';

const args = process.argv.slice(2);
const versionType = args[0];

if (!versionType) {
  console.error('No version type provided, use any of "patch", "minor" or "major"');
  process.exit(1);
}

function isValidVersionType(versionType: string): versionType is 'patch' | 'minor' | 'major' {
  return ['patch', 'minor', 'major'].some((v) => v === versionType);
}

if (!isValidVersionType(versionType)) {
  console.error(`Invalid version type: "${versionType}", use any of "patch", "minor" or "major"`);
  process.exit(1);
}

function createNewVersion(versionType: 'patch' | 'minor' | 'major') {
  try {
    const newVersion = execSync(`npm version ${versionType}`);
    console.log(`Version updated as ${versionType} version to: ${newVersion}`);
    return newVersion.toString().trim();
  } catch (error) {
    console.error('Failed to update version:', error);
    process.exit(1);
  }
}

function formatPackageJson(): void {
  try {
    console.log('Formatting package.json...');
    execSync('bun run lint:fix package.json', { stdio: 'inherit' });
    console.log('✅ package.json formatted successfully');
  } catch (error) {
    // If the specific lint command fails, try a general format
    try {
      execSync('bunx @biomejs/biome format --write package.json', { stdio: 'inherit' });
      console.log('✅ package.json formatted with Biome');
    } catch (fallbackError) {
      console.warn('⚠️ Could not format package.json automatically');
      console.warn('Please run "bun run lint:fix" manually if needed');
    }
  }
}

function pushTagForVersion(version: string): void {
  try {
    execSync(`git push --atomic origin main ${version}`);
    console.log(`Pushed tag ${version} to origin`);
  } catch (error) {
    console.error('Failed to push tag:', error);
    process.exit(1);
  }
}

const newVersion = createNewVersion(versionType);
formatPackageJson();
pushTagForVersion(newVersion);
console.log('Release done! 🚀');
