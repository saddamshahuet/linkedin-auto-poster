// Content templates for AI-generated posts
const aiContentTemplates = {
  'AI Infrastructure': {
    topics: [
      'Predictive maintenance in IT infrastructure',
      'AI-powered resource allocation and optimization', 
      'Intelligent monitoring and alerting systems',
      'Automated deployment and scaling',
      'Machine learning for capacity planning'
    ],
    keyPoints: [
      'Reduced downtime through predictive analytics',
      'Cost optimization via intelligent resource management',
      'Automated incident response and resolution', 
      'Enhanced performance monitoring',
      'Scalable infrastructure solutions'
    ]
  },
  
  'AI Cybersecurity': {
    topics: [
      'Real-time threat detection and prevention',
      'Behavioral analysis for zero-day attacks',
      'AI-powered incident response automation',
      'Advanced phishing and malware detection',
      'Predictive security analytics'
    ],
    keyPoints: [
      '99.7% threat detection accuracy',
      'Sub-30 second automated response times',
      '85% reduction in security incidents',
      '$3.8M average annual savings',
      'Proactive vs reactive security posture'
    ]
  },
  
  'Digital Transformation': {
    topics: [
      'AI-first business strategies and implementation',
      'Customer experience enhancement through AI',
      'Intelligent process automation and optimization',
      'Data-driven decision making with AI',
      'Supply chain optimization using machine learning'
    ],
    keyPoints: [
      '4x faster growth rates with AI adoption',
      '95% accuracy in predictive analytics',
      '70% improvement in customer satisfaction',
      '45% reduction in operational costs',
      '6-month ROI timeline for AI initiatives'
    ]
  },
  
  'Cloud Computing': {
    topics: [
      'AI-enhanced cloud resource optimization',
      'Intelligent cloud cost management',
      'Automated cloud security and compliance',
      'Multi-cloud orchestration with AI',
      'Edge computing and AI integration'
    ],
    keyPoints: [
      'Dynamic resource allocation',
      'Cost optimization through AI insights',
      'Enhanced security monitoring',
      'Seamless multi-cloud management',
      'Real-time performance optimization'
    ]
  },
  
  'Machine Learning': {
    topics: [
      'MLOps and production deployment strategies',
      'Real-time machine learning applications',
      'AutoML and democratizing AI development',
      'Federated learning and privacy-preserving AI',
      'Explainable AI and model interpretability'
    ],
    keyPoints: [
      'Faster time-to-market for ML models',
      'Scalable and reliable ML operations',
      'Enhanced model performance and accuracy',
      'Privacy-compliant AI solutions',
      'Transparent and interpretable results'
    ]
  }
};

// Hashtag sets for different content categories
const hashtagSets = {
  itInnovation: [
    '#AI', '#DigitalTransformation', '#TechInnovation', '#ArtificialIntelligence', 
    '#MachineLearning', '#Innovation', '#FutureOfWork', '#ITInfrastructure'
  ],
  
  cybersecurity: [
    '#CyberSecurity', '#ArtificialIntelligence', '#ThreatDetection', '#InfoSec', 
    '#AIInnovation', '#SecurityAnalytics', '#CyberDefense', '#ZeroTrust'
  ],
  
  digitalTransformation: [
    '#DigitalTransformation', '#AI', '#MachineLearning', '#Innovation', 
    '#BusinessIntelligence', '#FutureOfWork', '#DataDriven', '#Automation'
  ],
  
  cloudComputing: [
    '#CloudComputing', '#AWS', '#Azure', '#GCP', '#CloudNative', 
    '#DevOps', '#Infrastructure', '#Scalability', '#CloudSecurity'
  ],
  
  machineLearning: [
    '#MachineLearning', '#DataScience', '#AI', '#MLOps', '#DeepLearning', 
    '#PredictiveAnalytics', '#BigData', '#AlgorithmicThinking'
  ]
};

// Post structure templates
const postStructures = {
  statisticDriven: {
    opening: ['🚀', '⚡', '📈', '🌟', '💡'],
    structure: [
      'Hook with compelling statistic',
      'Brief context/problem statement', 
      'Key benefits/solutions (bullet points)',
      'Call-to-action question',
      'Relevant hashtags'
    ]
  },
  
  trendFocused: {
    opening: ['🔥', '🌊', '⭐', '🚀', '💫'],
    structure: [
      'Trend announcement/observation',
      'What\'s driving the trend',
      'Impact on businesses/industry',
      'Future implications',
      'Engagement question'
    ]
  },
  
  problemSolution: {
    opening: ['🛡️', '⚙️', '🎯', '🔧', '💪'],
    structure: [
      'Problem identification',
      'Traditional approach limitations',
      'AI/Tech solution benefits',
      'Real-world impact/metrics',
      'Implementation question'
    ]
  }
};

// Content themes and angles
const contentThemes = {
  roi: 'Return on Investment and business value',
  innovation: 'Cutting-edge technology and breakthroughs',
  efficiency: 'Operational improvements and optimization',
  security: 'Risk mitigation and protection strategies',
  transformation: 'Organizational change and modernization',
  future: 'Emerging trends and future predictions',
  implementation: 'Practical deployment and adoption strategies'
};

module.exports = {
  aiContentTemplates,
  hashtagSets,
  postStructures,
  contentThemes
};