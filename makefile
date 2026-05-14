SHELL=/bin/bash

help:  # Help
	@echo "Available options: format, database, playlists, recording-scans, update-mixcloud-data, compile-data, update-all"

install:  # Install requirements
	pip install -r requirements.in
	npm i

format:  # Format Python and JS files
	black .
	isort .
	npm run format

database:  # Converts XML database from data/vdj-database inot data/processed-files/database.json
	python scripts/database.py

playlists: database  # Gets song metadata for playlists
	python scripts/playlists.py

recording-scans: database  # Gets data for recordings including POIs
	python scripts/recordings.py

update-mixcloud-data: database  # Get updated data from Mixcloud
	python scripts/mixcloud.py

compile-data:  # Rewrite data without doing any additional data pulls
	python scripts/data.py

update-all: playlists recording-scans update-mixcloud-data compile-data  # Combines song data and mixcloud data into song-data.js

develop:  # Open development environment
	npm run develop

build:  # Build files to /dist/
	npm run build
