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
pushTagForVersion(newVersion);
console.log('Release done! 🚀');
