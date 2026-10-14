const { packager } = require('@electron/packager');
const path = require('path');

async function build() {
  console.log('Iniciando empaquetado de Guesscape para Windows (x64)...');
  
  const ignorePatterns = [
    /^\/android/,
    /^\/fotos/,
    /^\/\.git/,
    /^\/dist/,
    /^\/\.system_generated/,
    /^\/.*\.apk$/,
    /^\/.*\.zip$/,
    /^\/.*\.bat$/
  ];

  const appPaths = await packager({
    dir: __dirname,
    name: 'Guesscape',
    platform: 'win32',
    arch: 'x64',
    out: path.join(__dirname, 'dist'),
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    overwrite: true,
    prune: true,
    ignore: ignorePatterns,
    appCopyright: 'Copyright © 2026 Guesscape',
    appVersion: '1.2.0',
    buildVersion: '1.2.0',
    win32metadata: {
      CompanyName: 'Guesscape',
      FileDescription: 'Guesscape - Geography Quiz Game',
      OriginalFilename: 'Guesscape.exe',
      ProductName: 'Guesscape',
      InternalName: 'Guesscape'
    }
  });

  console.log('Empaquetado completado en:', appPaths);
}

build().catch(err => {
  console.error('Error durante el empaquetado:', err);
  process.exit(1);
});
