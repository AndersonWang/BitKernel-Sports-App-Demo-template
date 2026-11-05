const fs = require('node:fs');
const crypto = require('node:crypto');
const parts = [0,1,2].map(i => fs.readFileSync('junior-fc-export-parts/video.' + i));
const video = Buffer.concat(parts);
const hash = crypto.createHash('sha1').update('blob ' + video.length + '\0').update(video).digest('hex');
if (hash !== '24e9b7081d62bfc568c01b2985925650c3ee8221') throw new Error('Video integrity check failed');
fs.writeFileSync('junior-fc-export/media/35989d8c-0e8b-4528-a083-477552f9a889.mp4', video);
console.log('Junior FC export ready; original video verified.');
