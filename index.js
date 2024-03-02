import inquirer from "inquirer";
import { Command } from "commander";
import pkg from "cli-table3";
const Table = pkg;
import axios from "axios";
import fs from "fs";

// change your file names here
const savedJobsFile = "jobBoardSaves.json";
const searchCacheFile = "searchCache.json";

// change your server URL here
const serverURL = "http://localhost:3000";

const saveJobsToFile = (jobs) => {
	fs.writeFileSync(
		savedJobsFile,
		JSON.stringify(jobs, null, 2),
		"utf8"
	);
};

const loadSavedJobs = () => {
	try {
		const data = fs.readFileSync(
			savedJobsFile,
			"utf8"
		);
		return JSON.parse(data);
	} catch (error) {
		return [];
	}
};

const loadSearchCache = () => {
	try {
		const data = fs.readFileSync(
			searchCacheFile,
			"utf8"
		);
		return JSON.parse(data);
	} catch (error) {
		return [];
	}
};

const saveSearchCache = (results) => {
	fs.writeFileSync(
		searchCacheFile,
		JSON.stringify(results, null, 2),
		"utf8"
	);
};

const program = new Command();
program
	.version("1.0.0")
	.description("A job board CLI tool");

program
	.command("search")
	.description("Search for jobs")
	.option("--role <type>", "Role/Position")
	.option("--location <type>", "Location")
	.option("--site <name>", "Site")
	.option("--type <jobType>", "Job Type")
	.option("--company <name>", "Company")
	.action(async (options) => {
		const answers = await inquirer.prompt([
			{
				type: "input",
				name: "role",
				message: "Role/Position:",
				when: !options.role,
			},
			{
				type: "input",
				name: "location",
				message: "Location:",
				when: !options.location,
			},
			{
				type: "input",
				name: "site",
				message: "Site:",
				when: !options.site,
			},
			{
				type: "input",
				name: "type",
				message: "Job Type:",
				when: !options.type,
			},
			{
				type: "input",
				name: "company",
				message: "Company:",
				when: !options.company,
			},
		]);

		const response = await axios.get(
			`${serverURL}/search`,
			{
				params: {
					role: options.role || answers.role,
					location:
						options.location || answers.location,
					site: options.site || answers.site,
					type: options.type || answers.type,
					company:
						options.company || answers.company,
				},
			}
		);
		const jobs = response.data;

		displayJobsTable(jobs);
		saveSearchCache(jobs);
	});

program
	.command("save")
	.description("Save a job")
	.option("--jobid <id>", "Job ID")
	.action((options) => {
		const searchCache = loadSearchCache();

		const jobToSave =
			searchCache[options.jobid - 1];

		if (jobToSave) {
			const savedJobs = loadSavedJobs();
			savedJobs.push(jobToSave);
			saveJobsToFile(savedJobs);
			console.log(`Job saved!`);
			displayJobsTable([jobToSave]);
		} else {
			console.log(
				`Job with ID ${options.jobid} not found.`
			);
		}
	});

program
	.command("view-saved")
	.description("View saved jobs")
	.action(() => {
		const savedJobs = loadSavedJobs();
		displayJobsTable(savedJobs);
		console.log("Viewing saved jobs...");
	});

program
	.command("load-cache")
	.description("load cached jobs")
	.action(() => {
		const cachedJobs = loadSearchCache();
		displayJobsTable(cachedJobs);
		console.log("Viewing cached jobs...");
	});

function displayJobsTable(jobs) {
	const table = new Table({
		colWidths: [8, 20, 15, 20, 20, 50, 20],
		wordWrap: true,
		wrapWord: true,
		wrapOnWordBoundary: false,
		head: [
			"Number",
			"Position",
			"Company",
			"Location",
			"Posting Date",
			"URL",
			"Source",
		],
	});

	jobs.forEach((job, index) => {
		table.push([
			index + 1,
			job.Position,
			job.Company,
			job.Location,
			job.PostingDate,
			job.URL,
			job.Source,
		]);
	});

	console.log(table.toString());
}

program.parse(process.argv);
