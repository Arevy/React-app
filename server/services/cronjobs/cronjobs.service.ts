import { Logger } from "../logger.service";
import OnportStatusMappings from "./status-mappings";
import { timebombs } from "./timebombs";

export type CronJob = {
	runImmediately: boolean;
	interval: number; // seconds
	run: () => any;
	stop?: () => any;
};

export class CronjobsService {
	intervals: { [cronName: string]: ReturnType<typeof setInterval> } = {};

	init = () => {
		Object.entries(this.cronjobs).forEach(([cronName, cronjob]) => {
			cronjob.stop = () => clearInterval(this.intervals[cronName]);

			async function runCron() {
				const t = Date.now();

				try {
					Logger.info(`running cronjob [STARTED]`, {
						cronName,
						interval: cronjob.interval,
					});

					await cronjob.run();

					Logger.info(`running cronjob [DONE]`, {
						took: Date.now() - t,
						cronName,
					});
				} catch (error) {
					Logger.warn(`Cronjobs service :: failed to run cron job`, {
						failed_in: Date.now() - t,
						cronName,
						error,
					});
				}
			}

			if (cronjob.runImmediately) {
				runCron();
			}
			this.intervals[cronName] = setInterval(runCron, cronjob.interval * 1000);
		});
	};

	cronjobs: { [cronName: string]: CronJob } = {
		timebombs: {
			runImmediately: false,
			interval: Number(process.env.CRON_TIMEBOMBS),
			run: async () => {
				if (!process.env.ONPORT_MASTER_TOKEN) {
					throw "did not find ONPORT_MASTER_TOKEN";
				}

				return await timebombs();
			},
		},

		onportStatusMappings: {
			runImmediately: true,
			interval: Number(process.env.CRON_STATUS_MAPPINGS),
			run: async () => {
				return OnportStatusMappings.getInstance().getStatuses();
			},
		},
	};
}
