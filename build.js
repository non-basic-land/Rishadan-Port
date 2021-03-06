var NwBuilder = require('nw-builder');
var nw = new NwBuilder({
    files: ['./package.json', './notify.js', './index.html', './node_modules/**/*', './alarm.ogg', './quiet.ogg'],
    platforms: ['osx64', 'win64'],
    version: '0.14.6'
});

nw.on('log',  console.log);

nw.build().then(function () {
    console.log('all done!');
}).catch(function (error) {
    console.error(error);
});
