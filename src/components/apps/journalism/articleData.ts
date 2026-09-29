export interface ArticleSection {
  id: string;
  title: string;
  category?: string;
  paragraphs: string[];
  subsections?: {
    subtitle: string;
    content: string;
  }[];
  callout?: string;
}

export const AUTHOR_DATA = {
  name: 'Aya Kalimah Satya Ruane',
  credentials: 'CPRS, CHW',
  credentialsFull: 'Certified Peer Recovery Specialist (CPRS) • Community Health Worker (CHW)',
  roles: [
    'Citizen Journalist for [your]NEWS',
    'Community Health Worker (CHW)',
    'Certified Peer Recovery Supporter (CPRS)',
    'Nonprofit Grant Writer (Wildflower Nest Foundation)',
    'Community Organizer (A Place To Go CLE)',
    'Transgender Mother & Human Rights Advocate',
    'Leader of AQILA (American Queer Insurrection and Liberation Army)'
  ],
  url: 'https://yournews.com/author/aya-kalimah-satya-ruane-cprs-chw/',
  publishedUrl: 'https://yournews.com/author/aya-kalimah-satya-ruane-cprs-chw/',
  avatarUrl: '/avatar.jpg',
  bio: `Aya Kalimah Satya Ruane is a community health worker, peer supporter, grant writer, and citizen journalist whose life and work are rooted in fierce advocacy for marginalized communities. As a transgender mother who has endured the unimaginable loss of her child to violence, Aya channels her grief into purpose—using her voice, her music, and her writing to illuminate injustice and inspire healing.

Aya’s work centers on uplifting those often left behind: LGBTQ individuals, people experiencing addiction, housing insecurity, and mental illness. She collaborates with nonprofits across the country, including her role as a grant writer for the Wildflower Nest Foundation in Austin, Texas, and as a community health worker with Haus of Transcendent. Her grassroots organization, A Place To Go CLE, provides vital support and safe spaces for vulnerable populations in Cleveland, Ohio.

As a citizen journalist for YourNews, Aya brings lived experience and unflinching honesty to her reporting, amplifying stories that demand attention and compassion. Her activism is not just professional—it’s personal, urgent, and deeply human. Whether through a grant proposal, a song, or a story, Aya Kalimah Satya Ruane is a relentless advocate for dignity, equity, and transformative change.`,
  organizations: [
    {
      name: 'A Place To Go CLE',
      location: 'Cleveland, Ohio',
      role: 'Founder & Grassroots Organizer',
      description: 'Provides vital support, emergency safe spaces, harm reduction supplies, and trauma-informed care for vulnerable LGBTQ+ and street populations in Greater Cleveland.'
    },
    {
      name: 'Wildflower Nest Foundation',
      location: 'Austin, Texas',
      role: 'Grant Writer & Strategist',
      description: 'Securing critical funding and foundation resources to uplift marginalized families, shelter initiatives, and grassroots recovery networks.'
    },
    {
      name: 'Haus of Transcendent',
      location: 'National / Regional',
      role: 'Community Health Worker (CHW)',
      description: 'Delivering trauma-informed peer navigation, healthcare bridge services, and crisis stabilization for transgender and gender-diverse community members.'
    },
    {
      name: 'AQILA',
      location: 'Midwest & National',
      role: 'Advocacy Leader',
      description: 'American Queer Insurrection and Liberation Army: grassroots self-defense, mutual aid networks, and underground survival infrastructure.'
    },
    {
      name: '[your]NEWS Citizen Journalism',
      location: 'National Press',
      role: 'Citizen Journalist & Columnist',
      description: 'Investigative reporting illuminating human rights erosions, legislative overreach, peer recovery, and frontline community resistance.'
    }
  ],
  quote: 'Whether through a grant proposal, a song, or a story, Aya Kalimah Satya Ruane is a relentless advocate for dignity, equity, and transformative change.'
};

export const ARTICLE_DATA = {
  title: "The Roadmap to Erasure: How Ohio's HB 249 and Global Shifts Threaten Local Liberties",
  url: 'https://yournews.com/2026/04/01/6750596/the-roadmap-to-erasure-how-ohios-hb-249-and-global/',
  publication: '[your]NEWS',
  publishedDate: 'April 1, 2026',
  byline: 'by Aya Kalimah Satya Ruane CPRS CHW',
  readTime: '8 min read',
  coverImage: 'https://assets.yournews.com/2026/04/Gemini_Generated_Image_82og9982og9982og.png',
  summary: `As Ohio House Bill 249 moves toward the Senate, community leaders are sounding the alarm on what they describe as a "legal scaffold" designed to systematically remove transgender individuals from public life. Under the guise of modernization, the bill reclassifies gender identity as "obscenity," creating a dangerous precedent that mirrors some of the darkest chapters of history.`,
  executiveHighlights: [
    {
      label: 'Ohio HB 249 Scope',
      value: 'Reclassifies public transgender existence as "adult cabaret" and criminal obscenity.'
    },
    {
      label: 'Penalties Imposed',
      value: 'First-Degree Misdemeanors to Fourth-Degree Felonies for existing in public around minors.'
    },
    {
      label: 'Global Context',
      value: 'US withdrawal from 66 international organizations, WHO, and UN Human Rights Council.'
    },
    {
      label: 'Emerging Response',
      value: 'Midwest Underground Railroad networks, Canadian asylum exemptions, and EU Human Rights Shields.'
    }
  ],
  sections: [
    {
      id: 'introduction',
      title: 'A Coordinated Assault on Human Rights',
      paragraphs: [
        'The current legislative and executive landscape in 2026 reveals a coordinated assault on human rights, environmental stability, and the international rules-based order. From the statehouse in Columbus to the Oval Office, new legal frameworks are being constructed to systematically marginalize vulnerable populations and dismantle the planet’s life-support systems.',
        'Ohio’s House Bill 249 (HB 249), titled the "Indecent Exposure Modernization Act," passed the House on March 25, 2026, and moved to the Senate the following day. While proponents frame it as a shield for children, a rigorous analysis reveals it as a legal scaffold designed to remove transgender and gender-conforming individuals from public life.'
      ],
      callout: '"This is not just a policy debate; it is an existential threat. By equating our existence with \'adult cabaret,\' the state is attempting to criminalize our very presence in the communities we call home."'
    },
    {
      id: 'reclassification',
      title: 'Reclassifying Identity as Obscenity',
      paragraphs: [
        'By expanding the definition of "adult cabaret" to include individuals exhibiting a "gender identity different from their biological sex," the bill reclassifies the public existence of transgender people as an "adult performance."',
        'This equates identity with "obscenity," allowing the state to charge individuals with First-Degree Misdemeanors or Fourth-Degree Felonies simply for appearing in public spaces where minors are present.'
      ]
    },
    {
      id: 'historical-parallels',
      title: 'Historical Parallels: The Slippery Slope of "Decency"',
      paragraphs: [
        'History shows that regulating "decency" is rarely the final destination; it is a floor for eventual elimination.'
      ],
      subsections: [
        {
          subtitle: "Germany's Paragraph 175",
          content: 'Initially regulated "acts," but was expanded in 1935 to include "intent," facilitating the transition from fines to concentration camps.'
        },
        {
          subtitle: 'US "Vagrancy" Laws',
          content: 'Post-Civil War codes regulated "idleness" to funnel Black Americans into the convict-leasing system.'
        },
        {
          subtitle: "Russia's \"Propaganda\" Law",
          content: 'What began as "protecting children" in 2013 evolved into designating the entire LGBTQ+ movement as an "extremist organization" by 2023.'
        }
      ]
    },
    {
      id: 'environmental-retreat',
      title: "Dismantling Life-Support Systems & International Pledges",
      paragraphs: [
        'The patterns of the Trump administration since January 2025 have evolved from "America First" into a systematic dismantling of global stability. Critics argue the administration has become an enemy of the planet and its people through several high-impact maneuvers.',
        "The administration has launched a full-scale assault on the Earth's life-support systems:"
      ],
      subsections: [
        {
          subtitle: 'Withdrawal from Global Pledges',
          content: 'On January 27, 2026, the U.S. formally exited the Paris Agreement for the second time. The administration also targeted the UN Framework Convention on Climate Change (UNFCCC), attempting to dismantle the entire foundation of international climate negotiation.'
        },
        {
          subtitle: 'Legal Deregulation',
          content: "The 2026 revocation of the \"Endangerment Finding\" removed the EPA's legal basis to regulate carbon, while 88 million acres of protected land have been opened for extraction."
        },
        {
          subtitle: 'Scientific Suppression',
          content: 'Experts have been purged from the NOAA and EPA, ending the tracking of critical health-related data regarding air pollution.'
        }
      ]
    },
    {
      id: 'diplomatic-vacuum',
      title: 'Withdrawal from 66 Global Organizations',
      paragraphs: [
        'In January 2026, the administration signed a memorandum withdrawing the United States from 66 international organizations, including 31 UN entities.',
        'Global Health & Rights: The U.S. has exited the World Health Organization (WHO), the UN Human Rights Council, and UNESCO.',
        'Targeting Vulnerable Groups: Among the abandoned bodies are those dedicated to protecting children in armed conflict, ending sexual violence in conflict, and the UN Population Fund (UNFPA). This retreat signals to regimes with poor human rights records that such protections are now optional.'
      ]
    },
    {
      id: 'militarization',
      title: 'Aggressive Military Action & The "Donroe Doctrine"',
      paragraphs: [
        'The administration has traded diplomacy for aggressive military action and territorial threats:'
      ],
      subsections: [
        {
          subtitle: 'Operation Epic Fury',
          content: 'On February 28, 2026, the U.S. and Israel launched massive joint strikes against Iran’s nuclear facilities and military infrastructure. These strikes sparked a regional war, causing a projected record high in battle-related deaths for 2026.'
        },
        {
          subtitle: 'Operation Absolute Resolve',
          content: 'In January 2026, U.S. forces carried out the first bombing of a South American capital in modern history to oust the Maduro regime in Venezuela.'
        },
        {
          subtitle: 'The "Donroe Doctrine"',
          content: "Asserting U.S. primacy in the Western Hemisphere, the administration has used economic coercion and military threats (including toward Canada's sovereignty) to deny \"foreign incursion,\" effectively treating the hemisphere as a private sphere of influence."
        }
      ]
    },
    {
      id: 'lifeboat-strategies',
      title: 'International "Lifeboat" Strategies & Asylum Pathways',
      paragraphs: [
        'As the internal erosion of rights accelerates, the global community is shifting from traditional diplomacy to "lifeboat" strategies. While a direct "hot war" with a nuclear-armed United States remains unlikely due to the risk of global escalation, a different kind of conflict is emerging.',
        'Nations with strong human rights frameworks are beginning to treat U.S. anti-LGBT legislation as a valid basis for protection:'
      ],
      subsections: [
        {
          subtitle: 'Canada & Manitoba Safe Third Country Exemptions',
          content: 'Provinces like Manitoba and organizations such as Rainbow Railroad are calling for expedited asylum. Legal challenges are underway to create exemptions to the "Safe Third Country" agreement for those facing felony charges under laws like HB 249.'
        },
        {
          subtitle: 'European Union Human Rights Shield',
          content: 'France, Spain, and Germany are expanding "Social Integration" and "Digital Nomad" visas to provide de facto paths to safety. The EU is debating a "Human Rights Shield" to protect activists targeted by identity-based criminalization.'
        }
      ]
    },
    {
      id: 'responsibility-to-protect',
      title: 'The Doctrine of Responsibility to Protect (R2P)',
      paragraphs: [
        'The transition from regulation to systemic violence is a pattern that rarely reverses without external pressure. The doctrine of Responsibility to Protect (R2P) suggests that when a state reclassifies an identity as "felonious," it has met the criteria for "incitement to persecution."',
        'Avoiding conflict now may simply allow the state to complete its "cleansing" of a population through legal and police actions. Historically, waiting for "hot war" means intervening only after the majority of the targeted group has already been lost.'
      ]
    },
    {
      id: 'call-to-action',
      title: 'A Call for International Intervention',
      paragraphs: [
        "The world must recognize these actions for what they are: a calculated attempt to define segments of the population out of existence while sacrificing the planet's future for short-term gain. This is a plea for international intervention:",
        "1. Sanctions and Diplomatic Pressure: Foreign governments must treat laws like HB 249 and federal military escalations as human rights abuses, applying economic consequences.",
        "2. Asylum Pathways: Human-rights-valuing nations must prepare expedited asylum for LGBTQ+ Americans and climate refugees fleeing state-sponsored persecution.",
        "3. Humanitarian Monitoring: International bodies must increase reporting on the ground in the U.S. to document the completion of this legislative \"roadmap\" before it reaches its final, tragic stage.",
        "If the international community remains silent while the locks are placed on the doors of democracy, they share the burden of the catastrophe that follows."
      ],
      callout: '"I am Aya Kalimah Satya Ruane, a transgender parent of a murdered child, leader of the American Queer Insurrection and Liberation Army, and this is my call to arms."'
    }
  ]
};
