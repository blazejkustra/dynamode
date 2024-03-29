module.exports = {
  sidebar: [
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'getting_started/introduction',
        'getting_started/installation',
        'getting_started/quick_start',
        'getting_started/import',
        'getting_started/configure',
      ],
    },
    {
      type: 'category',
      label: 'Guide',
      items: [
        {
          Entity: [
            {
              type: 'doc',
              id: 'guide/entity/modeling',
            },
            {
              type: 'doc',
              id: 'guide/entity/decorators',
            },
          ],
        },
        {
          Managers: [
            {
              type: 'doc',
              id: 'guide/managers/tableManager',
            },
            {
              type: 'doc',
              id: 'guide/managers/entityManager',
            },
          ],
        },
        'guide/condition',
        'guide/query',
        'guide/scan',
        'guide/transactions',
        'guide/stream',
        'guide/dynamode',
      ],
    },
    {
      type: 'doc',
      id: 'other/version_requirements',
    },
  ],
};
