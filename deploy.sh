#!/bin/bash
echo "building..."
npm run build
echo "archiving..."
cd /Users/frederic/projects/fredericaerts.com/public
tar -czvf frederic-aerts.tar.gz *
echo "scp..."
scp frederic-aerts.tar.gz frederic@178.62.74.16:/var/www/fredericaerts.com/html
rm frederic-aerts.tar.gz

ssh frederic@178.62.74.16 << EOF
cd /var/www/fredericaerts.com/html
tar -xzf "frederic-aerts.tar.gz"
rm frederic-aerts.tar.gz