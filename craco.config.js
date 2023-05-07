process.env.REACT_APP_IS_CLIENT = true;

module.exports = {
	devServer: (devServerConfig, { env, paths }) => {
		devServerConfig = {
			host: process.env.ENABLE_DEVSERVER_NETWORK ? "0.0.0.0" : "localhost",

			onBeforeSetupMiddleware: undefined,
			onAfterSetupMiddleware: undefined,

			proxy: {
				//forward all routes to local express server and still keep hot-module-replacement from webpack
				"/services/*": {
					target: `http://localhost:${process.env.REACT_APP_BACKEND_PORT}`,
					secure: false,
					changeOrigin: true,
					onError: function (err, req, res) {
						console.log("--- Webpack DEVSERVER proxy error", err);
						console.log(`req.body: ${req.body}`);
					},
				},
				"/api/*": {
					target: `http://localhost:${process.env.REACT_APP_BACKEND_PORT}`,
					secure: false,
					changeOrigin: true,
					onError: function (err, req, res) {
						console.log("--- Webpack DEVSERVER proxy error", err);
						console.log(`req.body: ${req.body}`);
					},
				},
			},
		};
		return devServerConfig;
	},
	webpack: {
		alias: {
			"@client": "src",
			"@server": "server",
			"@styles": "src/styles",
		},
	},
	typescript: {
		enableTypeChecking: true /* (default value) */,
	},
	eslint: {
		enable: false,
	},
};
