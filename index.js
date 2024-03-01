import inquirer from "inquirer";
import { Command } from "commander";
import pkg from "cli-table3";
const Table = pkg;
import { config } from "dotenv";
import axios from "axios";
import fs from "fs";
const result = config();
let jobs = [];

const fetchAndFormat = async (options) => {
	try {
		jobs = [];
		const jobicyOptions = {
			method: "GET",
			url: "https://jobicy.p.rapidapi.com/api/v2/remote-jobs",
			headers: {
				"X-RapidAPI-Key":
					process.env.RAPID_API_KEY,
				"X-RapidAPI-Host":
					"jobicy.p.rapidapi.com",
			},
		};
		const response = await axios.request(
			jobicyOptions
		);
		const data = response.data.jobs;

		data.forEach((job) => {
			const formattedJob = {
				Position: job.jobTitle,
				Company: job.companyName,
				Location: job.jobGeo,
				PostingDate: job.pubDate,
				URL: job.url,
				Source: "Jobicy",
			};

			jobs.push(formattedJob);
		});

		const remooteOptions = {
			method: "GET",
			url: "https://remoote-job-search1.p.rapidapi.com/remoote/jobs",
			headers: {
				"X-RapidAPI-Key":
					process.env.RAPID_API_KEY,
				"X-RapidAPI-Host":
					"remoote-job-search1.p.rapidapi.com",
			},
		};

		const response2 = await axios.request(
			remooteOptions
		);

		const data2 = response2.data;

		data2.jobs.forEach((job) => {
			const formattedJob = {
				Position: job.title,
				Company: job.company,
				Location: job.geo_raw,
				PostingDate: job.createdAt,
				URL: job.url,
				Source: "Remoote",
			};

			jobs.push(formattedJob);
		});

		const reedOptions = {
			method: "GET",
			url: "https://www.reed.co.uk/api/1.0/search",
			auth: {
				username: process.env.REED_API_KEY,
				password: "",
			},
		};

		const response4 = await axios.request(
			reedOptions
		);

		const data4 = response4.data;

		data4.results.forEach((job) => {
			const formattedJob = {
				Position: job.jobTitle,
				Company: job.employerName,
				Location: job.locationName,
				PostingDate: job.date,
				URL: job.jobUrl,
				Source: "Reed",
			};

			jobs.push(formattedJob);
		});

		if (options.role && options.location) {
			const linkedInOptions = {
				method: "POST",
				url: "https://linkedin-jobs-scraper-api.p.rapidapi.com/jobs",
				headers: {
					"content-type": "application/json",
					"X-RapidAPI-Key":
						process.env.RAPID_API_KEY,
					"X-RapidAPI-Host":
						"linkedin-jobs-scraper-api.p.rapidapi.com",
				},
				data: {
					title: options.role,
					location: options.location,
					rows: 100,
				},
			};

			const response3 = await axios.request(
				linkedInOptions
			);

			const data3 = response3.data;

			data3.forEach((job) => {
				const formattedJob = {
					Position: job.title,
					Company: job.companyName,
					Location: job.location,
					PostingDate: job.publishedAt,
					URL: job.jobUrl,
					Source: "LinkedIn",
				};

				jobs.push(formattedJob);
			});
		}
	} catch (error) {
		console.error("Error fetching data:", error);
	}
};

const savedJobsFile = "jobBoardSaves.json";
const searchCacheFile = "searchCache.json";

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
		await fetchAndFormat({});
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

		await fetchAndFormat(options);
		displayJobsTable(filteredJobs);
		saveSearchCache(filteredJobs);
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
