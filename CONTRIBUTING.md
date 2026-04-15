# Contributing

```sh
pnpm install	# install dependencies
pnpm start		# start the server with node (automatically compiles the project)
pnpm dev		# run the server in watch mode
pnpm devF		# compile the frontend in watch mode

pnpm test		# list all ts errors (using --noemit)
pnpm build		# compiles all ts

# the servers verbosity can be changed
VERBOSE=3 pnpm dev
```

## Project Structure
```
.
├─ backend/        # node.js + typescript server
│  ├─ dist/        # compiled backend js
│  ├─ routes/      # eg. /api/
│  ├─ server.ts    # main backend file
│  └─ tsconfig.json
├─ public/         # frontend
│  ├─ dist/        # compiled frontend js
│  ├─ index.html   # frontend html
│  ├─ src/         # fronted ts code
│  ├─ style.css    # frontend css
│  └─ tsconfig.json
├─ files/          # audio files
│  ├─ ...
│  └─ data.json    # database file
└─ package.json    # project config
```

