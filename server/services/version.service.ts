import * as fs from "fs";
import * as util from "util";

import { RequestHandler } from "express";

const fsReadFileAsync = util.promisify(fs.readFile);
const getVersion = async () => {
	const verFile = await fsReadFileAsync("./ci-version.json");
	const json = JSON.parse(verFile.toString());
	if (process.env.NODE_ENV === "development") {
		json["mage"] = process.env.MAGENTO_URL;
	}

	return json;
};

export const ciVersion: RequestHandler = async (_req, res) =>
	res.json(await getVersion().catch((err) => res.status(500).end(err)));
