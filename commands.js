const inquirer = require("inquirer");
const Table = require("cli-table3");

const jobsTable = new Table({
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

const searchJobs = async (options) => {
	// If no options provided, prompt the user
	if (
		!options.role ||
		!options.location ||
		!options.type ||
		!options.site
	) {
		const answers = await inquirer.prompt([
			{
				type: "input",
				name: "role",
				message: "Role/Position:",
			},
			{
				type: "input",
				name: "location",
				message: "Location:",
			},
			{
				type: "input",
				name: "type",
				message: "Job Type:",
			},
			{
				type: "input",
				name: "site",
				message: "Sites:",
			},
		]);

		options = { ...options, ...answers };
	}

	// Use the options to fetch job data and display in the table
	// Replace this with actual logic to fetch jobs from APIs
	const jobsData = []; // Fetch jobs data based on options

	jobsTable.length = 0; // Clear existing table
	jobsData.forEach((job, index) => {
		jobsTable.push([
			index + 1,
			job.position,
			job.company,
			job.location,
			job.postingDate,
			job.url,
			job.source,
		]);
	});

	console.log(jobsTable.toString());
};

const saveJob = (options) => {
	// Implement logic to save job based on the job ID
	console.log(
		`Job with ID ${options.jobid} saved.`
	);
};

const viewSavedJobs = () => {
	// Implement logic to fetch and display saved jobs
	console.log("Viewing saved jobs:");
	console.log(jobsTable.toString());
};

module.exports = {
	searchJobs,
	saveJob,
	viewSavedJobs,
};
