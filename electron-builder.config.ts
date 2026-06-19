import { Configuration } from 'electron-builder'

const config: Configuration = {
  appId: 'com.fukagawa.k8s-learning',
  productName: 'k8s Learning',
  directories: { output: 'dist/app' },
  files: ['dist/renderer/**/*', 'dist/main/**/*', 'categories/**/*'],
  win: { target: 'nsis' },
  nsis: { oneClick: false, allowToChangeInstallationDirectory: true },
}

export default config
