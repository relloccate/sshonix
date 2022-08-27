import { build as viteBuild } from 'vite';
import { build as electronBuild } from 'electron-builder';
import { rm } from 'fs/promises';

console.log('CLEARING DIST DIR');
await rm('./dist', { recursive: true, force: true });
console.log('\r\n\r\n');

console.log('BUILDING VITE');
// await viteBuild({ configFile: 'config/vite.config.main.ts' });
// await viteBuild({ configFile: 'config/vite.config.renderer.ts' });
await viteBuild({ configFile: 'src/main/vite.config.ts' });
await viteBuild({ configFile: 'src/renderer/vite.config.ts' });
console.log('\r\n\r\n');

console.log('BUILDING APP');
await electronBuild({
    config: {
        files: ['dist'],
        extraFiles: ['src/main/assets'],
        appId: 'YourAppID',
        asar: true,
        directories: {
            output: 'dist/release/${version}'
        },
        win: {
            icon: 'src/main/assets/1.ico',
            target: [
                {
                    target: 'nsis',
                    arch: ['x64']
                }
            ],
            artifactName: '${name}-v${version}-${arch}-${os}-installer.${ext}'
        },
        productName: 'SSHONIX',
        copyright: '2022 Relloccate (Tool Mix)',
        nsis: {
            oneClick: false,
            perMachine: false,
            allowToChangeInstallationDirectory: true,
            deleteAppDataOnUninstall: false
        }
    }
})
    .then(result => {
        console.log(JSON.stringify(result));
    })
    .catch(error => {
        console.error(error);
    });

console.log('\r\n\r\n');
console.log('DONE');
