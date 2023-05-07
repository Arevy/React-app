#!/usr/bin/env node

// .env vars
require("dotenv-flow").config({
	node_env: process.env.NODE_ENV,
});

// bitbucket vars
require("dotenv-json")({ path: "./ci-version.json" });

import "./server";
