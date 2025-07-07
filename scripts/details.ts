import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('What is your project name? ', (name: string) => {
  rl.question('What is your project description? ', async (description: string) => {
    rl.question('What is your project author?', async (author: string) => {
      rl.question('What is your project repository?', async (repository: string) => {
        rl.question('What is your project license?', async (license: string) => {
          const packageJsonFile = Bun.file('./package.json');
          const packageJsonText = await packageJsonFile.text();
          const packageJson = JSON.parse(packageJsonText);

          const updatedPackageJson = {
            ...packageJson,
            name,
            description,
            author,
            repository,
            license,
          };

          await Bun.write(packageJsonFile, JSON.stringify(updatedPackageJson, null, 2));

          console.log(`Updated package.json with name: ${name} and description: ${description}`);
          rl.close();
        });
      });
    });
  });
});
