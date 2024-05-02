"""Constants used across multiple files"""

from pathlib import Path

# Directories

DATA_DIR = Path("data")
VDJ_EXPORT_DIR = Path(DATA_DIR, "vdj-database")
MIXCLOUD_EXPORT_DIR = Path(DATA_DIR, "mixcloud-export")
PROCESSED_FILES_DIR = Path(DATA_DIR, "processed-files")
SONG_LISTS_DIR = Path(PROCESSED_FILES_DIR, "song-lists")

# Files
VDJ_DB_FILE = Path(VDJ_EXPORT_DIR, "database.xml")
JSON_DB_FILE = Path(PROCESSED_FILES_DIR, "database.json")
