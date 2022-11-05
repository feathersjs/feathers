const comparisonSidebar = [
  {
    text: 'Compare Feathers',
    items: [
      {
        text: 'Overview',
        link: '/comparison'
      },
      {
        text: 'Feathers vs Firebase',
        link: '/feathers-vs-firebase'
      },
      {
        text: 'Feathers vs Meteor',
        link: '/feathers-vs-meteor'
      },
      {
        text: 'Feathers vs Sails',
        link: '/feathers-vs-sails'
      },
      {
        text: 'Feathers vs Loopback',
        link: '/feathers-vs-loopback'
      }
    ]
  }
]

export default {
  '/guides': [
    {
      text: 'Getting Started',
      collapsible: true,
      items: [
        {
          text: 'Quick start',
          link: '/guides/basics/starting.md'
        },
        {
          text: 'Creating an app',
          link: '/guides/basics/generator.md'
        },
        {
          text: 'Services',
          link: '/guides/basics/services.md'
        },
        {
          text: 'Hooks',
          link: '/guides/basics/hooks.md'
        },
        {
          text: 'Schemas',
          link: '/guides/basics/schemas.md'
        },
        {
          text: 'Authentication',
          link: '/guides/basics/authentication.md'
        }
        // {
        //   text: 'Writing Tests',
        //   link: '/guides/basics/testing.md'
        // }
      ]
    },
    {
      text: 'Frontend',
      collapsible: true,
      items: [
        {
          text: 'JavaScript',
          link: '/guides/frontend/javascript.md'
        }
        // {
        //   text: 'Frontend Frameworks',
        //   link: '/guides/frameworks.md'
        // }
      ]
    },
    {
      text: 'CLI',
      collapsible: true,
      collapsed: true,
      items: [
        {
          text: 'Overview',
          link: '/guides/cli/index.md'
        },
        {
          text: 'Generate App',
          link: '/guides/cli/generate-app.md'
        },
        {
          text: 'Configuration',
          link: '/guides/cli/config.md'
        },
        {
          text: 'Validators',
          link: '/guides/cli/validators.md'
        },
        {
          text: 'Service Classes',
          link: '/guides/cli/service-classes.md'
        },
        {
          text: 'Service Hooks',
          link: '/guides/cli/service-hooks.md'
        },
        {
          text: 'Schemas and Resolvers',
          link: '/guides/cli/schemas-and-resolvers.md'
        }
      ]
    },
    {
      text: 'Migrating',
      // collapsible: true,
      items: [
        {
          text: 'Migration guide',
          link: '/guides/migrating.md'
        },
        {
          text: "What's new?",
          link: '/guides/whats-new.md'
        }
      ]
    }
  ],
  '/api': [
    {
      text: 'Core',
      collapsible: true,
      items: [
        {
          text: 'Application',
          link: '/api/application'
        },
        {
          text: 'Services',
          link: '/api/services'
        },
        {
          text: 'Hooks',
          link: '/api/hooks'
        },
        {
          text: 'Events',
          link: '/api/events'
        },
        {
          text: 'Errors',
          link: '/api/errors'
        }
      ]
    },
    {
      text: 'Transports',
      collapsible: true,
      collapsed: true,
      items: [
        {
          text: 'Configuration',
          link: '/api/configuration'
        },
        {
          text: 'Koa',
          link: '/api/koa'
        },
        {
          text: 'Express',
          link: '/api/express'
        },
        {
          text: 'Socket.io',
          link: '/api/socketio'
        },
        {
          text: 'Channels',
          link: '/api/channels'
        }
      ]
    },
    {
      text: 'Authentication',
      collapsible: true,
      collapsed: true,
      items: [
        {
          text: 'Overview',
          link: '/api/authentication/'
        },
        {
          text: 'Service',
          link: '/api/authentication/service'
        },
        {
          text: 'Hook',
          link: '/api/authentication/hook'
        },
        {
          text: 'Strategies',
          link: '/api/authentication/strategy'
        },
        {
          text: 'JWT',
          link: '/api/authentication/jwt'
        },
        {
          text: 'Local',
          link: '/api/authentication/local'
        },
        {
          text: 'OAuth',
          link: '/api/authentication/oauth'
        }
      ]
    },
    {
      text: 'Client',
      collapsible: true,
      collapsed: true,
      items: [
        {
          text: 'Feathers Client',
          link: '/api/client'
        },
        {
          text: 'REST Client',
          link: '/api/client/rest'
        },
        {
          text: 'Socket.io Client',
          link: '/api/client/socketio'
        },
        {
          text: 'Authentication',
          link: '/api/authentication/client'
        }
      ]
    },
    {
      text: 'Schema',
      collapsible: true,
      collapsed: true,
      items: [
        {
          text: 'Overview',
          link: '/api/schema/'
        },
        {
          text: 'TypeBox',
          link: '/api/schema/typebox'
        },
        {
          text: 'JSON schema',
          link: '/api/schema/schema'
        },
        {
          text: 'Validators',
          link: '/api/schema/validators'
        },
        {
          text: 'Resolvers',
          link: '/api/schema/resolvers'
        }
      ]
    },
    {
      text: 'Databases',
      collapsible: true,
      collapsed: true,
      items: [
        {
          text: 'Adapters',
          link: '/api/databases/adapters'
        },
        {
          text: 'Common API',
          link: '/api/databases/common'
        },
        {
          text: 'Querying',
          link: '/api/databases/querying'
        },
        {
          text: 'MongoDB',
          link: '/api/databases/mongodb'
        },
        {
          text: 'SQL',
          link: '/api/databases/knex'
        },
        {
          text: 'Memory',
          link: '/api/databases/memory'
        }
      ]
    }
  ],
  '/help': [
    {
      text: 'Help',
      items: [
        {
          text: 'Getting Help',
          link: '/help/'
        },
        {
          text: 'FAQ',
          link: '/help/faq'
        },
        {
          text: 'Security',
          link: '/guides/security.md'
        }
      ]
    }
  ],
  '/cookbook': [
    {
      text: 'General',
      items: [
        {
          text: 'Scaling',
          link: '/cookbook/general/scaling'
        }
      ]
    },
    {
      text: 'Authentication',
      items: [
        {
          text: 'Anonymous',
          link: '/cookbook/authentication/anonymous'
        },
        {
          text: 'API Key',
          link: '/cookbook/authentication/apiKey'
        },
        {
          text: 'Auth0',
          link: '/cookbook/authentication/auth0'
        },
        {
          text: 'Facebook',
          link: '/cookbook/authentication/facebook'
        },
        {
          text: 'Google',
          link: '/cookbook/authentication/google'
        },
        {
          text: 'Firebase',
          link: '/cookbook/authentication/firebase'
        },
        {
          text: 'Discord',
          link: '/cookbook/authentication/_discord'
        },
        {
          text: 'Stateless JWT',
          link: '/cookbook/authentication/stateless'
        },
        {
          text: 'Revoking JWTs',
          link: '/cookbook/authentication/revoke-jwt'
        }
      ]
    },
    {
      text: 'Express',
      items: [
        {
          text: 'File Uploads',
          link: '/cookbook/express/file-uploading'
        },
        {
          text: 'View Engine SSR',
          link: '/cookbook/express/view-engine'
        }
      ]
    },
    {
      text: 'Deployment',
      items: [
        {
          text: 'Dockerize a Feathers App',
          link: '/cookbook/deploy/docker'
        }
      ]
    }
  ],
  '/comparison': comparisonSidebar,
  '/feathers-vs-firebase': comparisonSidebar,
  '/feathers-vs-meteor': comparisonSidebar,
  '/feathers-vs-sails': comparisonSidebar,
  '/feathers-vs-loopback': comparisonSidebar
}
