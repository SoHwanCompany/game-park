import { mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const projectRoot = process.cwd();

const directoryPairs = [
  ['.claude/agents', '.Codex/agents'],
  ['.claude/commands', '.Codex/commands'],
  ['.claude/memory', '.Codex/memory'],
];

const filePairs = [
  ['.claude/pr-rules.md', '.Codex/pr-rules.md'],
  ['docs/claude-agents.md', 'docs/Codex-agents.md'],
];

const replacementPairs = [
  ['Claude Code', 'Codex'],
  ['Claude', 'Codex'],
  ['CLAUDE.md', 'AGENTS.md'],
  ['docs/claude-agents.md', 'docs/Codex-agents.md'],
  ['.claude/', '.Codex/'],
  ['.claude', '.Codex'],
];

const replaceAll = (content) => {
  return replacementPairs.reduce((accumulator, [source, target]) => {
    return accumulator.split(source).join(target);
  }, content);
};

const syncFile = async (sourceRelativePath, targetRelativePath) => {
  const sourcePath = path.join(projectRoot, sourceRelativePath);
  const targetPath = path.join(projectRoot, targetRelativePath);
  const content = await readFile(sourcePath, 'utf8');
  const transformedContent = replaceAll(content);

  await mkdir(path.dirname(targetPath), { recursive: true });
  await writeFile(targetPath, transformedContent, 'utf8');
};

const syncDirectory = async (sourceRelativePath, targetRelativePath) => {
  const sourcePath = path.join(projectRoot, sourceRelativePath);
  const targetPath = path.join(projectRoot, targetRelativePath);

  await rm(targetPath, { force: true, recursive: true });
  await mkdir(targetPath, { recursive: true });

  const entries = await readdir(sourcePath, { withFileTypes: true });

  for (const entry of entries) {
    const sourceEntryPath = path.join(sourcePath, entry.name);
    const targetEntryPath = path.join(targetPath, entry.name);

    if (entry.isDirectory()) {
      await syncDirectory(
        path.relative(projectRoot, sourceEntryPath),
        path.relative(projectRoot, targetEntryPath),
      );

      continue;
    }

    const entryStats = await stat(sourceEntryPath);

    if (!entryStats.isFile()) {
      continue;
    }

    await syncFile(
      path.relative(projectRoot, sourceEntryPath),
      path.relative(projectRoot, targetEntryPath),
    );
  }
};

const main = async () => {
  for (const [sourcePath, targetPath] of directoryPairs) {
    await syncDirectory(sourcePath, targetPath);
  }

  for (const [sourcePath, targetPath] of filePairs) {
    await syncFile(sourcePath, targetPath);
  }

  process.stdout.write('Synced Claude config into Codex assets.\n');
};

await main();
