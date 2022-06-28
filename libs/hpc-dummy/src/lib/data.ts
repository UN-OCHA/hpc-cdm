import { DummyData } from './data-types';

/**
 * TODO: Something weird is going on with these json imports, it's importing
 * them with default rather than importing them directly... this is definitely
 * not what's supposed to happen and we should look into that...
 */
import * as formAImport from './forms/form-a.json';
import * as formCImport from './forms/form-c.json';
let formA = formAImport;
let formC = formCImport;
if ('default' in formA) {
  formA = (formA as unknown as { default: typeof formA }).default;
}
if ('default' in formC) {
  formC = (formC as unknown as { default: typeof formC }).default;
}

export const INITIAL_DATA: DummyData = {
  access: {
    active: [
      {
        target: { type: 'global' },
        grantee: {
          type: 'user',
          id: 0,
        },
        roles: ['hpc_admin'],
      },
    ],
    invites: [],
    auditLog: [],
  },
  users: [
    {
      id: 0,
      user: {
        name: 'Admin User',
      },
      email: 'admin@example.com',
    },
    {
      id: 1,
      user: {
        name: 'Operation Lead',
      },
      email: 'oplead@example.com',
    },
    {
      id: 2,
      user: {
        name: 'Cluster Lead',
      },
      email: 'cllead@example.com',
    },
  ],
  currentUser: null,
  flows: [
    {
      id: 1,
      versionID: 1,
      amountUSD: '20200000',
      updatedAt: '2022-02-17T16:15:44.590Z',
      origAmount: null,
      origCurrency: null,
      activeStatus: true,
      restricted: false,
      childIDs: [2, 3],
      parentIDs: null,
      categories: [
        {
          name: 'Paid',
          group: 'flowStatus',
        },
        {
          name: 'Financial',
          group: 'contributionType',
        },
        {
          name: 'Traditional aid',
          group: 'method',
        },
        {
          name: 'Parked',
          group: 'flowType',
        },
        {
          name: 'Earmarked',
          group: 'earmarkingType',
        },
        {
          name: 'USAID/BHA',
          group: 'keywords',
        },
        {
          name: 'West Bank and Gaza',
          group: 'keywords',
        },
      ],
      organizations: [
        {
          objectID: 1,
          refDirection: 'destination',
          name: 'World Food Programme',
        },
        {
          objectID: 2933,
          refDirection: 'source',
          name: 'United States of America, Government of',
        },
      ],
      plans: [],
      locations: [
        {
          name: 'Occupied Palestinian territory',
        },
      ],
      usageYears: [
        {
          year: '2021',
          refDirection: 'destination',
        },
        {
          year: '2021',
          refDirection: 'source',
        },
      ],
      reportDetails: [
        {
          id: 1,
          refCode:
            '10042194\tNo\t72029421IO00001\tUSA-C-02015-01\tPS01.01.011.URT1',
          organizationID: 1,
          source: 'Primary',
          sourceID: null,
          date: '2022-02-01T00:00:00.000Z',
          channel: 'Email',
        },
      ],
    },
    {
      id: 2,
      versionID: 1,
      amountUSD: '6685723',
      updatedAt: '2022-02-15T16:15:44.482Z',
      origAmount: null,
      origCurrency: null,
      activeStatus: true,
      restricted: false,
      childIDs: null,
      parentIDs: [1],
      categories: [
        {
          name: 'Paid',
          group: 'flowStatus',
        },
        {
          name: 'Financial',
          group: 'contributionType',
        },
        {
          name: 'Standard',
          group: 'flowType',
        },
        {
          name: 'Traditional aid',
          group: 'method',
        },
        {
          name: 'Earmarked',
          group: 'earmarkingType',
        },
        {
          name: 'USAID/BHA',
          group: 'keywords',
        },
        {
          name: 'West Bank and Gaza',
          group: 'keywords',
        },
      ],
      organizations: [
        {
          objectID: 1,
          refDirection: 'destination',
          name: 'World Food Programme',
        },
        {
          objectID: 1,
          refDirection: 'source',
          name: 'World Food Programme',
        },
      ],
      plans: [
        {
          name: 'Occupied Palestinian territory 2021',
        },
      ],
      locations: [
        {
          name: 'Occupied Palestinian territory',
        },
      ],
      usageYears: [
        {
          year: '2021',
          refDirection: 'destination',
        },
        {
          year: '2021',
          refDirection: 'source',
        },
      ],
      reportDetails: [
        {
          id: 2,
          refCode:
            '10042194\tNo\t72029421IO00001\tUSA-C-02015-01\tPS01.01.011.URT1',
          organizationID: 1,
          source: 'Primary',
          sourceID: null,
          date: '2022-02-01T00:00:00.000Z',
          channel: 'Email',
        },
      ],
    },
    {
      id: 3,
      versionID: 1,
      amountUSD: '13514277',
      updatedAt: '2022-02-16T16:14:31.838Z',
      origAmount: null,
      origCurrency: null,
      activeStatus: true,
      restricted: false,
      childIDs: null,
      parentIDs: [1],
      categories: [
        {
          name: 'Paid',
          group: 'flowStatus',
        },
        {
          name: 'Financial',
          group: 'contributionType',
        },
        {
          name: 'Standard',
          group: 'flowType',
        },
        {
          name: 'Traditional aid',
          group: 'method',
        },
        {
          name: 'Earmarked',
          group: 'earmarkingType',
        },
        {
          name: 'USAID/BHA',
          group: 'keywords',
        },
        {
          name: 'West Bank and Gaza',
          group: 'keywords',
        },
      ],
      organizations: [
        {
          objectID: 1,
          refDirection: 'destination',
          name: 'World Food Programme',
        },
        {
          objectID: 1,
          refDirection: 'source',
          name: 'World Food Programme',
        },
      ],
      plans: [
        {
          name: 'Occupied Palestinian territory 2021',
        },
      ],
      locations: [
        {
          name: 'Occupied Palestinian territory',
        },
      ],
      usageYears: [
        {
          year: '2021',
          refDirection: 'destination',
        },
        {
          year: '2021',
          refDirection: 'source',
        },
      ],
      reportDetails: [
        {
          id: 3,
          refCode:
            '10042194\tNo\t72029421IO00001\tUSA-C-02015-01\tPS01.01.011.URT1',
          organizationID: 1,
          source: 'Primary',
          sourceID: null,
          date: '2022-02-01T00:00:00.000Z',
          channel: 'Email',
        },
      ],
    },
  ],
  operations: [
    {
      id: 0,
      name: 'Operation with no reporting window',
    },
    {
      id: 1,
      name: 'Operation with a reporting window, and cluster and operation assignments',
    },
    {
      id: 2,
      name: 'Operation with multiple reporting windows',
    },
    {
      id: 3,
      name: 'Operation with a reporting window, and cluster assignments',
    },
    {
      id: 4,
      name: 'Operation with a reporting window, and operation assignments',
    },
  ],
  operationClusters: [
    {
      id: 10,
      operationId: 1,
      abbreviation: 'CCM',
      name: 'Camp Coordination & Management',
    },
    {
      id: 11,
      operationId: 1,
      abbreviation: 'EDU',
      name: 'Education',
    },
    {
      id: 12,
      operationId: 1,
      abbreviation: 'HEA',
      name: 'Health',
    },
    {
      id: 13,
      operationId: 1,
      abbreviation: 'PRO',
      name: 'Protection',
    },
    {
      id: 14,
      operationId: 3,
      abbreviation: 'PRO',
      name: 'Protection',
    },
  ],
  organizations: [
    {
      id: 122,
      name: 'Abyei Community Action for Development',
      nativeName: 'Abyei Community Action for Development',
      abbreviation: 'ACAD',
      url: null,
      parentID: null,
      comments: null,
      verified: true,
      notes: null,
      active: true,
      collectiveInd: false,
      newOrganizationId: null,
      createdAt: '2017-01-14T00:53:48.514Z',
      updatedAt: '2020-11-24T16:30:30.322Z',
      deletedAt: null,
      categories: [
        {
          id: 118,
          name: 'NGO',
          description: null,
          parentID: null,
          code: null,
          group: 'organizationType',
          includeTotals: null,
          createdAt: '2017-01-13T22:18:02.367Z',
          updatedAt: '2017-02-28T22:07:15.306Z',
          categoryRef: {
            objectID: 122,
            versionID: 1,
            objectType: 'organization',
            categoryID: 118,
            createdAt: '2017-01-14T00:56:40.168Z',
            updatedAt: '2017-01-14T00:56:40.168Z',
          },
        },
        {
          id: 131,
          name: 'Local',
          description: null,
          parentID: 118,
          code: null,
          group: 'organizationType',
          includeTotals: null,
          createdAt: '2017-01-13T22:18:02.709Z',
          updatedAt: '2017-02-28T22:07:15.690Z',
          categoryRef: {
            objectID: 122,
            versionID: 1,
            objectType: 'organization',
            categoryID: 131,
            createdAt: '2020-11-24T16:30:30.364Z',
            updatedAt: '2020-11-24T16:30:30.364Z',
          },
        },
      ],
    },
    {
      id: 540,
      name: 'Action for Development',
      nativeName: 'Action for Development',
      abbreviation: 'AFOD',
      url: 'http://www.afodi.org/',
      parentID: null,
      comments:
        'Action for Development (AFOD) is a non-profit, non-denominational, apolitical and   non-sectarian non-Government Organization (NGO) founded by a team of volunteers in 2011 and legally registered in South Sudan by the Ministry of Justice under the registrar of Companies, NGOs, Societies and Associations in June 2013 and Relief & Rehabilitation Commission (RRC). It was initiated by a group of volunteers who saw the need to address and champion the voice and needs of the marginalized and vulnerable communities in the South Sudan. It originated as a result of increasingly high level of poverty, very poor health indicators, high malnutrition rates in children, high prevalence of the HIV/AIDS, high illiteracy levels, low girl child enrollment & completion rates in schools, socioeconomic gender disparity, environmental issues and conflicts among other in the communities both in urban and rural areas of South Sudan.',
      verified: true,
      notes: null,
      active: true,
      collectiveInd: false,
      newOrganizationId: null,
      createdAt: '2017-01-14T00:53:49.768Z',
      updatedAt: '2019-10-14T09:35:49.616Z',
      deletedAt: null,
      categories: [
        {
          id: 130,
          name: 'National',
          description: null,
          parentID: 118,
          code: null,
          group: 'organizationType',
          includeTotals: null,
          createdAt: '2017-01-13T22:18:02.688Z',
          updatedAt: '2017-02-28T22:07:15.671Z',
          categoryRef: {
            objectID: 540,
            versionID: 1,
            objectType: 'organization',
            categoryID: 130,
            createdAt: '2019-10-14T09:35:49.676Z',
            updatedAt: '2019-10-14T09:35:49.676Z',
          },
        },
        {
          id: 118,
          name: 'NGO',
          description: null,
          parentID: null,
          code: null,
          group: 'organizationType',
          includeTotals: null,
          createdAt: '2017-01-13T22:18:02.367Z',
          updatedAt: '2017-02-28T22:07:15.306Z',
          categoryRef: {
            objectID: 540,
            versionID: 1,
            objectType: 'organization',
            categoryID: 118,
            createdAt: '2017-12-09T00:03:39.717Z',
            updatedAt: '2017-12-09T00:03:39.717Z',
          },
        },
      ],
    },
    {
      id: 2244,
      name: "Centre d'action pour le dévéloppement",
      nativeName: 'Center for Action for Development',
      abbreviation: 'CAD',
      url: "https://www.centrengo.org/ngo-resource-directory/844/centre-daction-pour-le-developpement-cad/#:~:text=Le%20Centre%20d'Action%20pour,aux%20enfants%20en%20situation%20difficile.",
      parentID: null,
      comments:
        "Le Centre d'Action pour le Développement (CAD), accorde une attention soutenue aux enfants en difficultés et particulièrement ceux qui sont dans les rues et en domesticité. Sa mission: Venir en aide en tout temps et en tous lieux aux enfants en situation difficile.",
      verified: true,
      notes: null,
      active: true,
      collectiveInd: false,
      newOrganizationId: null,
      createdAt: '2017-01-14T00:53:55.178Z',
      updatedAt: '2022-05-19T08:22:47.900Z',
      deletedAt: null,
      categories: [
        {
          id: 118,
          name: 'NGO',
          description: null,
          parentID: null,
          code: null,
          group: 'organizationType',
          includeTotals: null,
          createdAt: '2017-01-13T22:18:02.367Z',
          updatedAt: '2017-02-28T22:07:15.306Z',
          categoryRef: {
            objectID: 2244,
            versionID: 1,
            objectType: 'organization',
            categoryID: 118,
            createdAt: '2017-01-14T00:56:56.894Z',
            updatedAt: '2017-01-14T00:56:56.894Z',
          },
        },
        {
          id: 131,
          name: 'Local',
          description: null,
          parentID: 118,
          code: null,
          group: 'organizationType',
          includeTotals: null,
          createdAt: '2017-01-13T22:18:02.709Z',
          updatedAt: '2017-02-28T22:07:15.690Z',
          categoryRef: {
            objectID: 2244,
            versionID: 1,
            objectType: 'organization',
            categoryID: 131,
            createdAt: '2022-05-19T08:22:47.926Z',
            updatedAt: '2022-05-19T08:22:47.926Z',
          },
        },
      ],
    },
    {
      id: 9802,
      name: 'Christian Action for Development and Support',
      nativeName: '',
      abbreviation: 'CADS',
      url: null,
      parentID: null,
      comments:
        'Christian Action for Development & Support (CADS) Organisation profile 2013 Organizational background The Christian Action for Development and Support (CADS) is a non-government sectarian, religious humanitarian development organization, currently operating in Northern Bahr el Ghazal. CADS’s prime purpose is capacity building and services delivery to the deprived and marginalized people of the society. In December 2013, violent conflict erupted in Juba within the Army, The SPLA. The disagreement started within the leadership of Sudan people Liberation Movement (SPLM) following a split into two groups. Government on one side, and former Vice President and SPLM leaders on the other side. The vice president and the other leaders later formed the SPLM/SPLA-In Opposition (SPLM/SPLA-IO and SPLM former detainees (SPLM-FD)',
      verified: true,
      notes: null,
      active: true,
      collectiveInd: false,
      newOrganizationId: null,
      createdAt: '2018-11-19T16:45:44.541Z',
      updatedAt: '2019-04-16T09:22:31.850Z',
      deletedAt: null,
      categories: [
        {
          id: 130,
          name: 'National',
          description: null,
          parentID: 118,
          code: null,
          group: 'organizationType',
          includeTotals: null,
          createdAt: '2017-01-13T22:18:02.688Z',
          updatedAt: '2017-02-28T22:07:15.671Z',
          categoryRef: {
            objectID: 9802,
            versionID: 1,
            objectType: 'organization',
            categoryID: 130,
            createdAt: '2019-04-16T09:22:31.819Z',
            updatedAt: '2019-04-16T09:22:31.819Z',
          },
        },
        {
          id: 118,
          name: 'NGO',
          description: null,
          parentID: null,
          code: null,
          group: 'organizationType',
          includeTotals: null,
          createdAt: '2017-01-13T22:18:02.367Z',
          updatedAt: '2017-02-28T22:07:15.306Z',
          categoryRef: {
            objectID: 9802,
            versionID: 1,
            objectType: 'organization',
            categoryID: 118,
            createdAt: '2018-11-19T16:45:44.616Z',
            updatedAt: '2018-11-19T16:45:44.616Z',
          },
        },
      ],
    },
    {
      id: 10583,
      name: 'Community Hope Aid Action for Development',
      nativeName: null,
      abbreviation: 'CHAAD',
      url: 'https://www.facebook.com/CHAAD-Communty-Hope-Aid-Action-for-Development-442635029902586/',
      parentID: null,
      comments:
        'Chaad founded in 2017 by youth with planed to support women ,children,and vulnerable members of the community.Our mission and vision is support community development like health ,education,protection and food security.',
      verified: true,
      notes: null,
      active: true,
      collectiveInd: false,
      newOrganizationId: null,
      createdAt: '2019-10-17T11:17:31.945Z',
      updatedAt: '2019-10-17T18:13:24.163Z',
      deletedAt: null,
      categories: [
        {
          id: 130,
          name: 'National',
          description: null,
          parentID: 118,
          code: null,
          group: 'organizationType',
          includeTotals: null,
          createdAt: '2017-01-13T22:18:02.688Z',
          updatedAt: '2017-02-28T22:07:15.671Z',
          categoryRef: {
            objectID: 10583,
            versionID: 1,
            objectType: 'organization',
            categoryID: 130,
            createdAt: '2019-10-17T11:17:31.988Z',
            updatedAt: '2019-10-17T11:17:31.988Z',
          },
        },
        {
          id: 118,
          name: 'NGO',
          description: null,
          parentID: null,
          code: null,
          group: 'organizationType',
          includeTotals: null,
          createdAt: '2017-01-13T22:18:02.367Z',
          updatedAt: '2017-02-28T22:07:15.306Z',
          categoryRef: {
            objectID: 10583,
            versionID: 1,
            objectType: 'organization',
            categoryID: 118,
            createdAt: '2019-10-17T11:17:31.978Z',
            updatedAt: '2019-10-17T11:17:31.978Z',
          },
        },
      ],
    },
    {
      id: 9655,
      name: 'Evident Action for Development',
      nativeName: 'Evident Action for Development',
      abbreviation: 'EVAD',
      url: 'https://evad-ss.org/',
      parentID: null,
      comments:
        'Evident Action For Development, EVAD is a voluntary, Non-profit Making Humanitarian and Development National Governmental Organization formed and legally registered by Relief and Rehabilitation Commission of South Sudan in 2018. EVAD has commitments to deliver a voluntary humanitarian support and provide relief assistance to the most vulnerable population recovering from disasters and to enhance international efforts to support victims of disasters by providing professional research studies to direct humanitarian intervention. EVAD was locally formed by a group of young talented South Sudanese and colleagues from the neighboring countries with primary aim to support the affected communities who are recovering from cyclone of disasters over decades.',
      verified: true,
      notes: null,
      active: true,
      collectiveInd: false,
      newOrganizationId: null,
      createdAt: '2018-10-30T13:45:14.695Z',
      updatedAt: '2019-08-07T13:17:05.179Z',
      deletedAt: null,
      categories: [
        {
          id: 118,
          name: 'NGO',
          description: null,
          parentID: null,
          code: null,
          group: 'organizationType',
          includeTotals: null,
          createdAt: '2017-01-13T22:18:02.367Z',
          updatedAt: '2017-02-28T22:07:15.306Z',
          categoryRef: {
            objectID: 9655,
            versionID: 1,
            objectType: 'organization',
            categoryID: 118,
            createdAt: '2018-10-30T13:45:14.774Z',
            updatedAt: '2018-10-30T13:45:14.774Z',
          },
        },
        {
          id: 130,
          name: 'National',
          description: null,
          parentID: 118,
          code: null,
          group: 'organizationType',
          includeTotals: null,
          createdAt: '2017-01-13T22:18:02.688Z',
          updatedAt: '2017-02-28T22:07:15.671Z',
          categoryRef: {
            objectID: 9655,
            versionID: 1,
            objectType: 'organization',
            categoryID: 130,
            createdAt: '2019-08-07T13:17:05.210Z',
            updatedAt: '2019-08-07T13:17:05.210Z',
          },
        },
      ],
    },
    {
      id: 12487,
      name: 'Positive Action for Development',
      nativeName: '',
      abbreviation: 'PAD',
      url: 'www.padehiopia.org',
      parentID: null,
      comments:
        'PAD strives to see a community of hope, humane, and social justice. Our mission is to bring people together to work in partnerships; Promote hope humanity and social justice for every human, life in all its fullness; to improve the livelihoods of the disadvantageous groups for Social and Inclusive Economic Growth through actively engaging in positive actions promoting responsive care and support and fight the causes of poverty in Ethiopia.',
      verified: true,
      notes: null,
      active: true,
      collectiveInd: false,
      newOrganizationId: null,
      createdAt: '2022-04-01T11:59:06.139Z',
      updatedAt: '2022-04-05T13:57:40.980Z',
      deletedAt: null,
      categories: [
        {
          id: 130,
          name: 'National',
          description: null,
          parentID: 118,
          code: null,
          group: 'organizationType',
          includeTotals: null,
          createdAt: '2017-01-13T22:18:02.688Z',
          updatedAt: '2017-02-28T22:07:15.671Z',
          categoryRef: {
            objectID: 12487,
            versionID: 1,
            objectType: 'organization',
            categoryID: 130,
            createdAt: '2022-04-01T11:59:06.180Z',
            updatedAt: '2022-04-01T11:59:06.180Z',
          },
        },
        {
          id: 118,
          name: 'NGO',
          description: null,
          parentID: null,
          code: null,
          group: 'organizationType',
          includeTotals: null,
          createdAt: '2017-01-13T22:18:02.367Z',
          updatedAt: '2017-02-28T22:07:15.306Z',
          categoryRef: {
            objectID: 12487,
            versionID: 1,
            objectType: 'organization',
            categoryID: 118,
            createdAt: '2022-04-01T11:59:06.171Z',
            updatedAt: '2022-04-01T11:59:06.171Z',
          },
        },
      ],
    },
    {
      id: 10121,
      name: 'Social Action for Development',
      nativeName: null,
      abbreviation: 'S.A.D',
      url: 'https://sadburundi.blogspot.com/',
      parentID: null,
      comments:
        "https://www.facebook.com/SADBdi/\n\nL’Association Social Action for Development « S.A.D » en sigle a été créée en 2010 et agréée sous le numéro 530/830/14/07/2011. La S.A.D a son siège social à Bujumbura la capitale, Zone Gihosha, Quartier Kigobe Sud, Avenue du Cinquantenaire, Rue Muhabo n°4 dans les enceintes de l’Ecole Technique Professionnelle à 100m de l’Ambassade des Etats Unis d’Amérique au Burundi. L’association Social Action for Development (SAD) est une association non gouvernementale et sans but lucratif qui soutient les personnes vulnérables en général, des enfants et des femmes en particulier. Son objectif est de les aider à trouver des solutions dans leurs difficultés en vue de se remettre dans un état de fonctionnement social adéquat. La vision de l’association S.A.D est celle des enfants burundais solidaires qui vivent en paix, dans un environnement protecteur, capables de jouir leurs droits, de mener une vie saine, équilibrée et plus digne. Nous voulons bâtir un monde d'espoir, de tolérance et de justice sociale. L’association Social Action for Development(SAD) est active au Burundi depuis 2010 avec pour objectif de renforcer le respect des droits de l’enfant au sein des familles et des communautés et de protéger les enfants contre toute forme de violence au sens de l’article 19 de la Convention Internationale des Droits de l’Enfant (CIDE) Ainsi, je suis le Représentant Légal de cette association.\nWebsite provided not accessible: www.socialactionfordevelopment.org",
      verified: true,
      notes: 'Updated website and abbreviation',
      active: true,
      collectiveInd: false,
      newOrganizationId: null,
      createdAt: '2019-03-28T18:07:55.343Z',
      updatedAt: '2020-10-20T10:09:42.992Z',
      deletedAt: null,
      categories: [
        {
          id: 118,
          name: 'NGO',
          description: null,
          parentID: null,
          code: null,
          group: 'organizationType',
          includeTotals: null,
          createdAt: '2017-01-13T22:18:02.367Z',
          updatedAt: '2017-02-28T22:07:15.306Z',
          categoryRef: {
            objectID: 10121,
            versionID: 1,
            objectType: 'organization',
            categoryID: 118,
            createdAt: '2019-03-28T18:07:55.376Z',
            updatedAt: '2019-03-28T18:07:55.376Z',
          },
        },
        {
          id: 130,
          name: 'National',
          description: null,
          parentID: 118,
          code: null,
          group: 'organizationType',
          includeTotals: null,
          createdAt: '2017-01-13T22:18:02.688Z',
          updatedAt: '2017-02-28T22:07:15.671Z',
          categoryRef: {
            objectID: 10121,
            versionID: 1,
            objectType: 'organization',
            categoryID: 130,
            createdAt: '2019-03-28T18:07:55.393Z',
            updatedAt: '2019-03-28T18:07:55.393Z',
          },
        },
      ],
    },
    {
      id: 11951,
      name: 'Youth Action for Development Agency',
      nativeName: '',
      abbreviation: 'AYADA',
      url: 'https://www.facebook.com/www.ayada.org/',
      parentID: null,
      comments:
        'Agricultural Youth Action for Development Agency- (AYADA) is a non-profit organization working in South Sudan for over 5 years, focusing on improving poverty and social injustice to end violence. We do this through well-planned and comprehensive programme in GBV, Health & WASH, education, livelihoods and response.  Our overall goal is the empowerment of Farmers, youth, women and girls from poor and marginalized communities, leading to improvement in their lives and livelihoods. ',
      verified: true,
      notes: null,
      active: true,
      collectiveInd: false,
      newOrganizationId: null,
      createdAt: '2021-02-22T16:28:51.662Z',
      updatedAt: '2021-03-15T12:56:05.388Z',
      deletedAt: null,
      categories: [
        {
          id: 118,
          name: 'NGO',
          description: null,
          parentID: null,
          code: null,
          group: 'organizationType',
          includeTotals: null,
          createdAt: '2017-01-13T22:18:02.367Z',
          updatedAt: '2017-02-28T22:07:15.306Z',
          categoryRef: {
            objectID: 11951,
            versionID: 1,
            objectType: 'organization',
            categoryID: 118,
            createdAt: '2021-02-22T16:28:51.688Z',
            updatedAt: '2021-02-22T16:28:51.688Z',
          },
        },
        {
          id: 131,
          name: 'Local',
          description: null,
          parentID: 118,
          code: null,
          group: 'organizationType',
          includeTotals: null,
          createdAt: '2017-01-13T22:18:02.709Z',
          updatedAt: '2017-02-28T22:07:15.690Z',
          categoryRef: {
            objectID: 11951,
            versionID: 1,
            objectType: 'organization',
            categoryID: 131,
            createdAt: '2021-02-22T16:28:51.691Z',
            updatedAt: '2021-02-22T16:28:51.691Z',
          },
        },
      ],
    },
  ],
  reportingWindows: [
    {
      id: 0,
      name: 'Some Reporting Window',
      state: 'open',
      associations: {
        operations: [1, 2, 3, 4],
      },
      assignments: [
        {
          id: 9932,
          version: 1,
          lastUpdatedAt: Date.now(),
          lastUpdatedBy: 'Some Admin',
          type: 'form',
          formId: 123,
          assignee: {
            type: 'operation',
            operationId: 1,
          },
          state: 'not-entered',
          currentData: null,
          currentFiles: [],
        },
        {
          id: 5925,
          version: 1,
          lastUpdatedAt: Date.now(),
          lastUpdatedBy: 'Some Admin',
          type: 'form',
          formId: 321,
          assignee: {
            type: 'operation',
            operationId: 1,
          },
          state: 'raw:entered',
          currentData: null,
          currentFiles: [],
        },
        {
          id: 5926,
          version: 1,
          lastUpdatedAt: Date.now(),
          lastUpdatedBy: 'Some Admin',
          type: 'form',
          formId: 321,
          assignee: {
            type: 'operationCluster',
            clusterId: 11,
          },
          state: 'raw:entered',
          currentData: null,
          currentFiles: [],
        },
        {
          id: 5927,
          version: 1,
          lastUpdatedAt: Date.now(),
          lastUpdatedBy: 'Some Admin',
          type: 'form',
          formId: 321,
          assignee: {
            type: 'operation',
            operationId: 4,
          },
          state: 'raw:entered',
          currentData: null,
          currentFiles: [],
        },
        {
          id: 5928,
          version: 1,
          lastUpdatedAt: Date.now(),
          lastUpdatedBy: 'Some Admin',
          type: 'form',
          formId: 321,
          assignee: {
            type: 'operationCluster',
            clusterId: 14,
          },
          state: 'raw:entered',
          currentData: null,
          currentFiles: [],
        },
      ],
    },
    {
      id: 1,
      name: 'Another Reporting Window',
      state: 'pending',
      associations: {
        operations: [2, 4],
      },
      assignments: [],
    },
    {
      id: 2,
      name: 'Closed Reporting Window',
      state: 'closed',
      associations: {
        operations: [2, 4],
      },
      assignments: [],
    },
  ],
  forms: [
    {
      id: 123,
      version: 1,
      name: 'A Form',
      definition: formA,
    },
    {
      id: 321,
      version: 1,
      name: 'Another form',
      definition: formC,
    },
  ],
};

// Add access to all things
for (const op of INITIAL_DATA.operations) {
  INITIAL_DATA.access.active.push({
    target: {
      type: 'operation',
      targetId: op.id,
    },
    grantee: {
      type: 'user',
      id: 0,
    },
    roles: ['operationLead'],
  });
  INITIAL_DATA.access.active.push({
    target: {
      type: 'operation',
      targetId: op.id,
    },
    grantee: {
      type: 'user',
      id: 1,
    },
    roles: ['operationLead'],
  });
  INITIAL_DATA.access.invites.push({
    target: {
      type: 'operation',
      targetId: op.id,
    },
    email: 'alex@example.com',
    roles: ['operationLead'],
    lastModifiedBy: 1,
  });
  INITIAL_DATA.access.auditLog.push({
    target: {
      type: 'operation',
      targetId: op.id,
    },
    grantee: {
      type: 'user',
      id: 1,
    },
    roles: ['operationLead'],
    actor: 0,
    date: Date.now(),
  });
}
