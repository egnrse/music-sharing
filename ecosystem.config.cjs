// pm2 config file
module.exports = {
	apps: [
		{
			name: "track3 (server)",
			script: "backend/dist/server.js",
			instances: 1,
			exec_mode: "fork",
			autorestart: true,
			// restart app if its using too much memory
			max_memory_restart: "500M",
			env: {
				NODE_ENV: "production",
				PORT: 3000,
			}
		}
	]
}
