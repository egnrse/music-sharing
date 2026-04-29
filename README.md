# track3
A simple tool to share/publish music on the web. Created for my artproject [3.Ndangered](https://egnrse.eu/music).



## Usage
Install:
- [pnpm](https://pnpm.io/)

```sh
# install dependencies
pnpm install
# start the server
pnpm start
```

This will start the server on [localhost:3000](http://localhost:3000).


Optionally install:  
- `ffmpeg` (for file duration)


### Production
I use pm2 for production.
```sh
# install pm2 globally
sudo npm install -g pm2
# build the project
pnpm build
# start the server
pm2 start ecosystem.config.cjs
```


## License
GNU General Public License v3.0 or later (GPL-3.0-or-later)
