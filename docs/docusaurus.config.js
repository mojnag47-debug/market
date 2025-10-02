// @ts-check
const { themes } = require('docusaurus-theme-redoc');

/** @type {import('@docusaurus/types').Config} */
module.exports = {
  title: 'NextGen Developer Handbook',
  tagline: 'Platform Documentation & Development Guide',
  url: 'https://docs.nextgen-marketplace.com',
  baseUrl: '/',
  favicon: 'img/favicon.ico',
  organizationName: 'NextGen',
  projectName: 'handbook',
  themes: ['redoc'],
  
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/nextgen-marketplace/handbook/edit/main/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],

  themeConfig: {
    navbar: {
      title: 'Dev Handbook',
      items: [
        { to: 'architecture', label: 'Architecture', position: 'left' },
        { to: 'api', label: 'APIs', position: 'left' },
        { to: 'onboarding', label: 'Onboarding', position: 'left' },
        { href: '/troubleshooting', label: 'Troubleshooting', position: 'right' },
      ],
    },
    redoc: {
      spec: '../api/openapi.yaml',
    },
  },
};