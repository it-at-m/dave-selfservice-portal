module.exports = {
    transpileDependencies: ['vuetify'],
    pwa: {
        name: 'DAVe Selfserviceportal',
        workboxPluginMode: 'InjectManifest',
        workboxOptions: {
            swSrc: 'src/service-worker.js'
        }
    }
};