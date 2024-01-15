# VirtualDJ Analysis

Scripts & projects around analysis of VirtualDJ datable.

## Quickstart

Unpack the contents of a VirtualDJ database export into `vdj-export`. The program expects a `database.xml` file as an immediate child to `vdj-export`.

From the project directory, scripts to run:

1. Convert XML to JSON: `python scripts/convert.py`
2. Extract Zouk Sets: `python scripts/zouk-sets.py`

Start the server with:

```
npm run start
```

## Scripts

### CUE File

Create a CUE file based off of cue points from a recorded set. Expects an up-to-date zouk-sets.json file, extracted from a database.xml dump.

```bash
python scripts/cue-file.py "{set file name}"
```

Outputs a `{set file name}.cue` file to `processed-files` directory.

## Develop

Format JS with `npm run format`

Format Python with `python black .`
