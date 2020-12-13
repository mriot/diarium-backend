#!/bin/bash

date=$(date '+%Y-%m-%d')
if cp db.sqlite "/Users/mkremer/OneDrive/DIARIUM/Content Backups/${date}.sqlite"
then
  echo "Done!"
else
  echo "Whoops, could not backup DB. Exit status $?"
fi
