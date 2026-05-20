# Contributing

```sh
pnpm install	# install dependencies
pnpm start		# start the server with node (automatically compiles the project)
pnpm dev		# run the server in watch mode
pnpm devF		# compile the frontend in watch mode

pnpm build		# compiles all ts
pnpm cli		# interactively add/edit song in the database

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
├─ shared/         # shared ts code (symlinked into modules)
│  ├─ shared.ts    # general shared constants/types/functions
│  └─ ...          # other shared objects
├─ files/          # audio files
│  ├─ ...
│  └─ data.json    # database file
├─ base-tsconfig.jsoncjs  # shared tsconfig settings
├─ ecosystem.config.cjs   # pm2 settings
└─ package.json	   # project config
```


## Test
We have some simple test:
```sh
pnpm test:front	# list all frontend ts errors (using --noemit)
pnpm test:back	# list all backend ts errors (using --noemit)
pnpm test:css	# css linting tests
pnpm test:html	# html linting tests
pnpm test		# run all tests
```


## Notes
Some useful commands:
```sh
pm2 start ecosystem.config.cjs
pm2 ls
pm2 dash
pm2 attach 0
pm2 delete 0

VERBOSE=6 NODE_OPTIONS="--no-deprecation" pnpm cli
```
