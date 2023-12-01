#!/bin/sh

basepath=`dirname "$0"`
cd "$basepath"

identity=$SPACETRACK_IDENTITY
password=$SPACETRACK_PASSWORD

if [ -z "$SPACETRACK_IDENTITY" ] || [ -z "$SPACETRACK_PASSWORD" ]
then
  echo 'ensure both "SPACETRACK_IDENTITY" and "SPACETRACK_PASSWORD" are set'
fi

source_url="https://www.space-track.org/basicspacedata/query/class/tle_latest/ORDINAL/1/EPOCH/%3Enow-30/orderby/NORAD_CAT_ID/format/json"
tle_file="../public/data/TLE.json"
output_file="../public/data/attributed-TLE.json"
current_date=`date -u +"%Y-%m-%dT%H:%M:%SZ"`
cookie_jar="/tmp/$USER-cookiejar"

echo "Downloading TLE data"
curl -c $cookie_jar -b $cookie_jar https://www.space-track.org/ajaxauth/login \
   -d "identity=$identity&password=$password"

curl ---limit-rate 100K -cookie $cookie_jar "${source_url}" > $tle_file

echo "Generating Attributed TLE file"
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
