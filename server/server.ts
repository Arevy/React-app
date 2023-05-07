import path from "path";

import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

// import { requestTime } from "@server/middleware";
import { frontendRouter, servicesRouter } from "@server/routers";

import { CronjobsService } from "./services";
import { Logger } from "./services/logger.service";

/* #region setup */

const port = process.env.REACT_APP_BACKEND_PORT;

const app = express();

/* #endregion */

/* #region middlewares */

app.use(cookieParser());

app.use(bodyParser.json());

// app.use(requestTime);

/* #endregion */

/* #region routers */

app.use("/api", cors(), frontendRouter());

/* #endregion */

/** #region services */

app.use("/services", servicesRouter());

const cronjobs = new CronjobsService();
cronjobs.init();

/* #endregion */

/* #region serve react-app */

if (process.env.NODE_ENV === "production") {
	app.use(express.static("build"));

	app.get("*", (req, res) => res.sendFile(path.resolve("./build/index.html")));
}

/* #endregion */

/* #region startup */

app.listen(port, () => {
	Logger.info("server started", {});
});

/* #endregion */
