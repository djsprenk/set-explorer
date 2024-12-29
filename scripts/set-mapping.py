"""
Utils for touching / modifying the set mapper.
Mostly from ChatGPT
"""

import json
import os
from pathlib import Path
from tkinter import Tk, filedialog
from urllib.parse import urlparse

from constants import OS_USERNAME, SET_MAPPER_FILE
from utils import read_json_file, write_json_file

MUSIC_DIR = Path("/Users", OS_USERNAME, "Music/Library/DJ Sets/DJ Sprenk")
VDJ_DIR = Path("/Users", OS_USERNAME, "Documents/VirtualDJ/MyLists")


def select_file(initial_dir=None, title="Select a File"):
    """
    Get a filepath (using Tkinter)

    Returns: Path or None
    """
    # Hide the root Tkinter window
    root = Tk()
    root.withdraw()

    # Open a file dialog and get the selected file path
    file_path = filedialog.askopenfilename(initialdir=initial_dir, title=title)

    # Check if a file was selected
    if file_path:
        return Path(file_path)
    else:
        print("No file selected.")
        return None


def main():

    # Get recording
    print("Select a recording")
    recording_file_path = select_file(initial_dir=MUSIC_DIR, title="Select a recording")
    if not recording_file_path:
        exit(0)
    if recording_file_path.suffix.lower() not in (".mp3", ".wav"):
        print("File must be an audio recording")
        exit(1)

    # Get playlist
    print(f"Select a playlist for {recording_file_path.name}")
    playlist_path = select_file(initial_dir=VDJ_DIR, title="Select a playlist")
    if not playlist_path:
        exit(0)
    if playlist_path.suffix.lower() != ".vdjfolder":
        print("Playlist must be a .vdjfolder")
        exit(1)

    # Get slug, if fully-qualified URL is provided, just get the end
    url = input(f"Enter the slug for {recording_file_path.name}")
    slug = urlparse(url).path.strip("/").split("/")[-1]
    if not slug:
        exit(0)

    # Get type of set
    set_selection = (
        input(f"Enter the set type: live set (1) or produced set (2)").lower().strip()
    )
    set_type = (
        "live-set" if set_selection in ("1", "live-set", "live", "live set") else None
    )
    set_type = (
        "produced-set"
        if set_selection in ("2", "produced-set", "produced", "produced set")
        else set_type
    )
    if not set_type:
        exit(0)

    set_info = {
        "playlist": str(playlist_path),
        "slug": str(slug),
        "recording": str(recording_file_path),
        "type": set_type,
    }

    # Verify
    verify = input(f"Does this look correct? [Y/n]\n{str(set_info)}").lower().strip()
    if verify == "n":
        print("Exiting")
        exit(0)

    # Add to SET_MAPPER_FILE
    print(f"Adding entry to {SET_MAPPER_FILE}")
    set_mapper = read_json_file(SET_MAPPER_FILE)
    set_mapper.append(set_info)
    write_json_file(set_mapper, SET_MAPPER_FILE)

    print(f"DONE!")


if __name__ == "__main__":
    main()
