# Data Setup

This folder holds data exports from several different sources.

- `vdj-database` holds a VirtualDJ Database dump.
- `processed-files` holds processed files from both intermediate and completed
  data transforms.

## VirtualDJ Database Dump

In VirtualDJ, create a database backup
([example](https://drive.google.com/drive/folders/1nLHNQm0gL-9LhUPKAxalmOWcFksMBcvI)).
This is a .ZIP file which needs to be unpacked and the contents moved into
`data/vdj-database`.

If done correctly, you should have a `database.xml` file as an immediate child
of `data/vdj-database`.

## Processed Files

Scripts save a fair amount of intermediate / processed files in a separate child
directory, `data/processed-files`. You may have to create this folder to allow
scripts to work correctly.
