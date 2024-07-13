"""Constants used across multiple files"""

from pathlib import Path

# Constants
MIXCLOUD_ACCOUNT_NAME = "djsprenk"
OS_USERNAME = "nathan"

# Directories
VDJ_DB_BACKUP_DIR = Path("/Users", OS_USERNAME, "Documents/VirtualDJ/Backup")
DATA_DIR = Path("data")
VDJ_EXPORT_DIR = Path(DATA_DIR, "vdj-database")
PROCESSED_FILES_DIR = Path(DATA_DIR, "processed-files")
SONG_LISTS_DIR = Path(PROCESSED_FILES_DIR, "song-lists")
RECORDINGS_DATA_DIR = Path(PROCESSED_FILES_DIR, "recording-scans")

# Overrides
SONGS_LIST_OVERRIDE_DIR = Path(SONG_LISTS_DIR, "overrides")
RECORDINGS_DATA_OVERRIDE_DIR = Path(RECORDINGS_DATA_DIR, "overrides")

# Data Output
DATA_OUTPUT_DIR = Path("public/data")

# Files
VDJ_DB_FILE = Path(VDJ_EXPORT_DIR, "database.xml")
JSON_DB_FILE = Path(PROCESSED_FILES_DIR, "database.json")
SET_MAPPER_FILE = Path(DATA_DIR, "set-mapper.json")
MIXCLOUD_DATA_FILE = Path(PROCESSED_FILES_DIR, "mixcloud-data.json")
SONG_DATA_FILE = Path(DATA_OUTPUT_DIR, "song-data.js")
