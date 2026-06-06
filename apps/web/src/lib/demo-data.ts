export const demoJobData = {
  candidate: {
    id: "demo",
    firstName: "Arjun",
    lastName: "Sharma",
    email: "arjun.sharma@example.com",
    institutionalEmail: "asharma@iitd.ac.in",
    githubUrl: "https://github.com/arjun-sharma-dev"
  },
  report: {
    id: "rep_demo",
    jobId: "demo",
    trustScore: 92,
    createdAt: new Date().toISOString(),
    findingsSummary: "Candidate shows strong consistency between resume claims and GitHub evidence. Academic background from IIT Delhi is verified. React and Node.js skills are heavily backed by recent, complex repositories.",
    semanticMatchJson: JSON.stringify([
      {
        claimedSkill: "React.js",
        matchedRepo: "react-ecommerce-dashboard",
        confidenceScore: 0.95,
        evidenceLevel: "STRONG",
        notes: "Repository contains complex React hooks, context API usage, and Redux state management."
      },
      {
        claimedSkill: "Node.js",
        matchedRepo: "express-microservices-auth",
        confidenceScore: 0.88,
        evidenceLevel: "STRONG",
        notes: "Extensive backend logic with Express, JWT authentication, and MongoDB integration."
      },
      {
        claimedSkill: "Docker",
        matchedRepo: "express-microservices-auth",
        confidenceScore: 0.75,
        evidenceLevel: "MODERATE",
        notes: "Found Dockerfiles and docker-compose configurations, but no advanced orchestrations."
      },
      {
        claimedSkill: "GraphQL",
        matchedRepo: "graphql-apollo-server",
        confidenceScore: 0.90,
        evidenceLevel: "STRONG",
        notes: "Extensive use of Apollo Server, schema definitions, and complex resolvers."
      }
    ]),
    academicVerificationJson: JSON.stringify([
      {
        claimedInstitution: "Indian Institute of Technology, Delhi",
        normalizedInstitution: "Indian Institute of Technology Delhi",
        degree: "B.Tech in Computer Science",
        graduationTimeline: "2018 - 2022",
        domainMatch: true,
        institutionVerified: true,
        confidenceScore: 0.98,
        evidenceLevel: "STRONG",
        riskFlags: []
      }
    ]),
    riskIndicatorsJson: JSON.stringify([
      {
        category: "Commit History Anomalies",
        severity: "LOW",
        description: "Small gap in GitHub commit history between Jan 2023 and March 2023."
      }
    ])
  },
  githubMetricsJson: JSON.stringify({
    publicReposCount: 24,
    totalCommitsCollected: 1240,
    analyzedRepos: [
      {
        name: "react-ecommerce-dashboard",
        description: "A full-stack admin dashboard for e-commerce.",
        primaryLanguage: "TypeScript",
        stars: 45,
        recentCommits: 120,
        lastUpdated: new Date().toISOString()
      },
      {
        name: "express-microservices-auth",
        description: "Authentication service built with Node.js.",
        primaryLanguage: "JavaScript",
        stars: 12,
        recentCommits: 85,
        lastUpdated: new Date(Date.now() - 864000000).toISOString()
      },
      {
        name: "graphql-apollo-server",
        description: "GraphQL API for social media application.",
        primaryLanguage: "TypeScript",
        stars: 32,
        recentCommits: 210,
        lastUpdated: new Date(Date.now() - 1728000000).toISOString()
      }
    ]
  }),
  certificateDataJson: JSON.stringify([
    {
      title: "AWS Certified Solutions Architect – Associate",
      issuer: "Amazon Web Services",
      trustScore: 98,
      sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      metadata: {
        "Issue Date": "August 2023",
        "Expiration Date": "August 2026",
        "Credential ID": "AWS-ASA-98231",
      },
      findings: [
        { severity: "LOW", description: "Cryptographic signature successfully validated against AWS registry keys." },
        { severity: "LOW", description: "No metadata tampering detected." }
      ]
    }
  ])
};
