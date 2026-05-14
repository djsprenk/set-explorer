# Set Explorer

Visualization of DJ sets for DJ Sprenk, published to [sets.djsprenk.com](sets.djsprenk.com) and [djsprenk.com/set-explorer](djsprenk.com/set-explorer)

## Quickstart

1. Create and activate a Python virtual environment.

```sh
virtualenv venv
source venv/bin/activate
```

2. Install project requirements.

```sh
make install
```

3. Download and unpack relevant data into `data/` (see [data/README.md](data/README.md))

4. Update [data/set-mapper.json](data/set-mapper.json) with appropriate mappings to files.

5. Run `make update-all` to compile and build data.

6. View site with `make develop`

## Develop

### Formatting

JS is formatted following [StandardJS](https://standardjs.com/) style.

Format JS with `npm run format`.

Python is formatted with [Black](https://github.com/psf/black).

Format Python with `python black .`
