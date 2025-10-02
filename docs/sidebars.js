module.exports = {
  docs: [
    {
      type: 'category',
      label: 'Getting Started',
      items: ['introduction', 'onboarding/checklist'],
    },
    {
      type: 'category',
      label: 'Architecture',
      items: [
        'architecture/adrs/0001-documentation-strategy',
        'architecture/microservices',
        'architecture/data-flows',
      ],
    },
    {
      type: 'category',
      label: 'Development',
      items: [
        'development/coding-standards',
        'development/api-guide',
        'development/testing-strategy',
      ],
    },
    {
      type: 'category',
      label: 'Operations',
      items: [
        'operations/deployment',
        'operations/monitoring',
        'troubleshooting/playbook',
      ],
    },
  ],
};