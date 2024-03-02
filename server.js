import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
const app = express();
const port = 3000;

import { config } from "dotenv";
const result = config();
app.use(bodyParser.json());

app.get("/search", async (req, res) => {
	const { role, location, site, type, company } =
		req.query;
	const options = {
		role,
		location,
		site,
		type,
		company,
	};
	const jobs = await fetchAndFormat(options);
	res.json(jobs);
});

const fetchAndFormat = async (options) => {
	let jobs = [];
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

		return filteredJobs;
	} catch (error) {
		console.error("Error fetching data:", error);
	}
};

app.listen(port, () => {
	console.log(
		`Server is running on port ${port}`
	);
});
