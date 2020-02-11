#! /usr/bin/env node
const Compiler = require('../lib/Compiler.js');
const path = require('path');

const configPath = path.resolve(process.cwd(), './pack.config.js');

const config = require(configPath);

const compiler = new Compiler(config);

compiler.run();
