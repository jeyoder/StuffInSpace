#!/bin/sh

tle_file="../public/data/TLE.json"
## curl > public/data/TLE.json

output_file="../public/data/attributed-TLE.json"
current_date=`date -u +"%Y-%m-%dT%H:%M:%SZ"`
echo "{
  \"source\": {
    \"name\": \"Space-Track.org\",
    \"url\": \"https://www.space-track.org/\"
  },
  \"date\": \"$current_date\",
  \"data\":
" > $output_file

cat $tle_file >> $output_file
echo "\n}\n" >> $output_file

