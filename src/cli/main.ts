#!/usr/bin/env node

import {spawn} from 'child_process';
import {once} from 'events';
import {join} from 'path';

import main from 'main-function';

import {detectPackageManger} from './@context';

const hasOwnProperty = Object.prototype.hasOwnProperty;

main(async ([firstArg, ...restArgs]) => {
  const cwd = process.cwd();

  const [name, dir] = await detectPackageManger(cwd);

  const {scripts = {}} = require(join(dir, 'package.json'));

  let command: string = name;
  let subcommand: string | undefined = firstArg;

  switch (firstArg) {
    case '--help':
    case '-h':
      console.info(`\
USAGES:

  xpm add/remove(rm)/install/run/exec [options]

  xpm [script] [options]
`);
      return;
    case undefined:
      subcommand = 'install';
      break;
    case 'add':
      switch (name) {
        case 'npm':
          subcommand = 'install';
          break;
      }

      break;
    case 'remove':
    case 'rm':
      switch (name) {
        case 'npm':
          subcommand = 'uninstall';
          break;
        case 'yarn':
          subcommand = 'remove';
          break;
      }

      break;
    case 'install':
      break;
    case 'run':
      break;
    case 'exec':
      switch (name) {
        case 'npm':
          command = 'npx';
          subcommand = undefined;
          break;
      }

      break;
    default:
      if (hasOwnProperty.call(scripts, command)) {
        subcommand = 'run';
      } else {
        switch (name) {
          case 'npm':
            command = 'npx';
            break;
          default:
            subcommand = 'exec';
            break;
        }
      }

      break;
  }

  const args = [subcommand, ...restArgs].filter(
    (arg): arg is string => typeof arg === 'string',
  );

  const cp = spawn(command, args, {
    shell: true,
    cwd: dir,
    stdio: 'inherit',
  });

  const [code] = (await once(cp, 'exit')) as [number];

  return code;
});