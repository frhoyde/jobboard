import inquirer from "inquirer";
import { Command } from "commander";
import pkg from "cli-table3";
const Table = pkg;

const jobs = [
	{
		Position: "Software Engineer",
		Company: "ABC Inc",
		Location: "San Francisco",
		PostingDate: "2024-02-27",
		URL: "https://example.com",
		Source: "LinkedIn",
	},
	// Add more job objects here
];

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

		const filteredJobs = jobs.filter((job) => {
			return (
				(options.role
					? job.Position.toLowerCase().includes(
							options.role.toLowerCase()
					  )
					: true) &&
				(options.location
					? job.Location.toLowerCase().includes(
							options.location.toLowerCase()
					  )
					: true) &&
				(options.site
					? job.Source.toLowerCase() ===
					  options.site.toLowerCase()
					: true) &&
				(options.type
					? job.Type.toLowerCase().includes(
							options.type.toLowerCase()
					  )
					: true) &&
				(options.company
					? job.Company.toLowerCase().includes(
							options.company.toLowerCase()
					  )
					: true)
			);
		});

		displayJobsTable(filteredJobs);
	});

program
	.command("save")
	.description("Save a job")
	.option("--jobid <id>", "Job ID")
	.action((options) => {
		// Implement saving logic based on options.jobid
		console.log(`Job ${options.jobid} saved!`);
	});

program
	.command("view-saved")
	.description("View saved jobs")
	.action(() => {
		// Implement logic to display saved jobs
		console.log("Viewing saved jobs...");
	});

function displayJobsTable(jobs) {
	const table = new Table({
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
