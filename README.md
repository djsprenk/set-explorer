# VirtualDJ Analysis

Scirpts & projects around analysis of VirtualDJ databse.

## Quickstart

Unpack the contents of a VirtualDJ database export into `vdj-epxort`. The program expects a `database.xml` file as an immediate child to `vdj-export`.

From the project directory, scripts to run:

1. Convert XML to JSON: `python scripts/convert.py`
2. Extract Zouk Sets: `python scripts/zouk-sets.py`

Start the server with:

```
npm run start
```

## Develop

Format JS with `npm run format`

Format Python with `python black .`
