/** @type {import('@docusaurus/types').DocusaurusConfig} */

const prismConfig = {
  plain: {
    color: '#ffffff',
    backgroundColor: '#001a72',
  },
  styles: [
    {
      types: ['comment'],
      style: {
        color: '#aaaaaa',
        fontStyle: 'italic',
      },
    },
    {
      types: ['string'],
      style: {
        color: '#ffffff',
      },
    },
    {
      types: ['punctuation'],
      style: {
        color: '#ffee86',
      },
    },
    {
      types: ['variable', 'constant', 'builtin', 'attr-name'],
      style: {
        color: '#a3b8ff',
      },
    },
    {
      types: ['number', 'operator'],
      style: {
        color: '#ffaaa8',
      },
    },
    {
      types: ['keyword'],
      style: {
        color: '#8ed3ef',
      },
    },
    {
      types: ['char'],
      style: {
        color: '#a3b8ff',
      },
    },
    {
      types: ['tag'],
      style: {
        color: '#ffaaa8',
      },
    },
    {
      types: ['function'],
      style: {
        color: '#a3b8ff',
      },
    },
  ],
};
/*
In swizzled components look for "SWM -" string to see our modifications
*/

module.exports = {
  title: 'Dynamode - DynamoDB Modeling Tool',
  tagline: "An intuitive ORM for Amazon's DynamoDB with full TypeScript Support and Validation",
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/fav_192x192.png',
  customFields: {
    shortTitle: 'Dynamode - NoSQL Database ORM',
  },
  url: 'https://www.blazejkustra.github.io',
  baseUrl: '/',
  organizationName: 'blazejkustra',
  projectName: 'dynamode',
  deploymentBranch: 'gh-pages',
  trailingSlash: false,
  themeConfig: {
    algolia: {
      appId: 'S40J7WL1BI',
      apiKey: '3d80058ec47985dd7ad5dee251c95019',
      indexName: 'dynamode',
    },
    metadata: [
      { name: 'keywords', content: 'dynamode, dynamodb, modeling tool, amazon, serverless, ODM, ORM' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
    colorMode: {
      disableSwitch: true,
    },
    navbar: {
      logo: {
        alt: 'Logo',
        src: 'img/dynamode-logo.png',
      },
      items: [
        {
          type: 'doc',
          position: 'right',
          docId: 'getting_started/introduction',
          label: 'Docs',
        },
        {
          href: 'https://www.npmjs.com/package/dynamode',
          className: 'npm-navbar-logo',
          'aria-label': 'npm',
          position: 'right',
        },
        {
          href: 'https://www.github.com/blazejkustra/dynamode',
          className: 'github-navbar-logo',
          'aria-label': 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      logo: {
        alt: 'Dynamode',
        src: 'img/dynamode.svg',
        href: 'https://www.github.com/blazejkustra/dynamode',
      },
    },
    prism: {
      theme: prismConfig,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          path: 'docs',
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://www.github.com/blazejkustra/dynamode/tree/master/docs',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
        googleAnalytics: {
          trackingID: 'UA-41044622-6',
          anonymizeIP: true,
        },
      },
    ],
  ],
};
