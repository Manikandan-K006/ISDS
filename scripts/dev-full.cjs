const { spawn } = require('node:child_process');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const processes = [
  spawn(npmCommand, ['run', 'dev'], { cwd: root, stdio: 'inherit' }),
  spawn(npmCommand, ['run', 'dev'], { cwd: path.join(root, 'server'), stdio: 'inherit' }),
];

const stop = () => {
  for (const child of processes) {
    if (!child.killed) child.kill();
  }
};

for (const child of processes) {
  child.on('exit', (code) => {
    if (code && code !== 0) {
      stop();
      process.exitCode = code;
    }
  });
}

process.on('SIGINT', () => {
  stop();
  process.exit(0);
});
