#!/usr/bin/env node

const program = require("commander");
const {
	searchJobs,
	saveJob,
	viewSavedJobs,
} = require("./commands");

program
	.command("search")
	.option("--role <type>", "Role/Position")
	.option("--location <type>", "Location")
	.option("--type <jobType>", "Job Type")
	.option("--site <name>", "Sites")
	.action(searchJobs);

program
	.command("save")
	.option("--jobid <id>", "Job ID")
	.action(saveJob);

program
	.command("view-saved")
	.action(viewSavedJobs);

program.parse(process.argv);

if (!program.args.length) {
	program.outputHelp();
}
