let common = [
  'features/**/*.feature',
  '--require-module ts-node/register',
  '--require-module tsconfig-paths/register',
  '--require features/step_definitions/**/*.ts',
  '--format @cucumber/pretty-formatter',
  '--format json:results.json',
  // '--tags=~@skip',
].join(' ')

module.exports = {
  default: common,
}
