export const generateMockData = () => {
  const serviceNames = [
    'auth-api',
    'payment-gateway',
    'checkout-service',
    'inventory-manager',
    'notification-worker',
    'user-profile',
    'search-indexer',
    'recommendation-engine',
  ];

  const deployers = [
    'github-actions@bot.gserviceaccount.com',
    'gitlab-ci@bot.gserviceaccount.com',
    'jane.doe@company.com',
    'kyle.dev@company.com',
  ];

  const statuses = ['success', 'success', 'success', 'success', 'success', 'failed', 'rollback'];

  const deployments = [];
  const serviceHealth = {};

  const now = new Date();

  serviceNames.forEach((service) => {
    // Generate health data
    const maxInstances = Math.floor(Math.random() * 10) + 2;
    const minInstances = Math.floor(Math.random() * 2) + 1;
    const activeInstances = Math.floor(Math.random() * (maxInstances - minInstances + 1)) + minInstances;
    
    // Status Logic for the Service purely based on random health
    let serviceStatus = '🟢 Healthy';
    let uptime = (99 + Math.random()).toFixed(2);
    if (Math.random() > 0.8) {
      serviceStatus = '🟡 Degraded';
      uptime = (95 + Math.random() * 4).toFixed(2);
    } else if (Math.random() > 0.95) {
      serviceStatus = '🔴 Failing';
      uptime = (90 + Math.random() * 5).toFixed(2);
    }

    let revisionCounter = Math.floor(Math.random() * 100) + 10;
    
    // Generate 15-40 deployments per service over the last 30 days
    const numDeployments = Math.floor(Math.random() * 25) + 15;
    
    for (let i = 0; i < numDeployments; i++) {
        const daysAgo = Math.random() * 30;
        const timestamp = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const deployer = deployers[Math.floor(Math.random() * deployers.length)];
        
        const sha = Math.random().toString(16).substring(2, 9);
        const imageTag = `us-docker.pkg.dev/gcp-project/containers/${service}:${sha}`;
        const revision = `${service}-${String(revisionCounter).padStart(5, '0')}`;
        
        deployments.push({
            id: `${service}-${sha}-${timestamp.getTime()}`,
            serviceName: service,
            revision,
            imageTag,
            deployer,
            status,
            timestamp: timestamp.toISOString(),
        });
        
        revisionCounter--;
    }

    // Sort this service's deployments to find the latest
    const serviceDeployments = deployments
        .filter(d => d.serviceName === service)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
    const lastDeploy = serviceDeployments.find(d => d.status === 'success');

    // Generate 28-day uptime history for the sparkline.
    // Each bucket is a percentage (0–100). Distribution is weighted by status.
    const generateUptimeHistory = (status) => {
      return Array.from({ length: 28 }, (_, i) => {
        let base, variance;
        if (status.includes('Healthy')) {
          base = 99.5; variance = 1.5;
        } else if (status.includes('Degraded')) {
          base = 96.0; variance = 8.0;
        } else {
          base = 88.0; variance = 20.0;
        }
        // Inject a visible incident in the last 7 days ~25% of the time
        const isRecent = i > 20;
        const hasIncident = isRecent && Math.random() > 0.75;
        const drop = hasIncident ? Math.random() * 40 : 0;
        return Math.max(0, Math.min(100, base + (Math.random() - 0.5) * variance - drop));
      });
    };

    serviceHealth[service] = {
      name: service,
      status: serviceStatus,
      uptime: `${uptime}%`,
      instances: `${activeInstances} / ${maxInstances}`,
      maxInstances,
      activeInstances,
      currentRevision: lastDeploy ? lastDeploy.revision : `${service}-00001`,
      lastDeployTime: lastDeploy ? lastDeploy.timestamp : now.toISOString(),
      uptimeHistory: generateUptimeHistory(serviceStatus),
    };
  });

  // Sort all deployments by time descending
  deployments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return { deployments, serviceHealth };
};

export const { deployments: initialDeployments, serviceHealth: initialServiceHealth } = generateMockData();
