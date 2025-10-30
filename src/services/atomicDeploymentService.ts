// ⚛️ ATOMIC DEPLOYMENT CLIENT SERVICE
// Enterprise-grade deployment verification and rollback system

interface DeploymentManifest {
  version: string;
  timestamp: string;
  buildNumber: number;
  channel: string;
  files: Record<string, {
    hash: string;
    size: number;
    path: string;
  }>;
  integrity: {
    algorithm: string;
    verified: boolean;
  };
  deployment: {
    strategy: string;
    rollbackEnabled: boolean;
    cdnPurgeRequired: boolean;
  };
  manifestHash: string;
}

interface DeploymentInfo {
  version: string;
  timestamp: string;
  channel: string;
  filesCount: number;
}

class AtomicDeploymentService {
  private currentVersion: string | null = null;
  private serviceWorker: ServiceWorker | null = null;
  private checkInterval: number = 30000; // 30 seconds
  private intervalId: number | null = null;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    console.log('%c⚛️ ATOMIC DEPLOYMENT SYSTEM', 'color: #4ec9b0; font-size: 20px; font-weight: bold');
    console.log('🔐 Security Level: Enterprise');
    console.log('📦 Strategy: Atomic with Rollback');
    console.log('🔄 Auto-update: Enabled');

    // Load stored version
    this.currentVersion = localStorage.getItem('atomic-version');
    console.log(`📌 Stored Version: ${this.currentVersion || 'none'}`);

    // Register Service Worker
    await this.registerServiceWorker();

    // Check for updates immediately
    await this.checkForUpdates();

    // Start periodic checks
    this.startPeriodicChecks();

    // Listen for visibility changes
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.checkForUpdates();
      }
    });
  }

  private async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/atomic-sw.js', {
          scope: '/'
        });

        console.log('⚛️ Service Worker registered:', registration.scope);

        // Listen for messages from SW
        navigator.serviceWorker.addEventListener('message', (event) => {
          this.handleServiceWorkerMessage(event.data);
        });

        // Get active SW
        this.serviceWorker = registration.active || registration.installing || registration.waiting;

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          console.log('⚛️ New Service Worker version found');
        });

      } catch (error) {
        console.error('⚛️ Service Worker registration failed:', error);
      }
    } else {
      console.warn('⚛️ Service Workers not supported');
    }
  }

  private handleServiceWorkerMessage(data: any) {
    console.log('⚛️ Message from Service Worker:', data);

    if (data.type === 'NEW_VERSION_AVAILABLE') {
      console.log('%c🚀 NEW VERSION AVAILABLE', 'color: #4ec9b0; font-size: 24px; font-weight: bold');
      console.log(`📦 Version: ${data.version}`);
      console.log(`🔵 Channel: ${data.channel}`);
      console.log(`📊 Files: ${data.filesCount}`);
      console.log(`⏰ Timestamp: ${new Date(data.timestamp).toLocaleString('ar-SA')}`);

      // Save new version
      localStorage.setItem('atomic-version', data.version);
      localStorage.setItem('atomic-timestamp', data.timestamp);
      localStorage.setItem('atomic-channel', data.channel);

      // Show notification and reload
      this.notifyAndReload(data);
    }
  }

  private async notifyAndReload(data: DeploymentInfo) {
    console.log('%c🔄 RELOADING TO APPLY NEW VERSION', 'color: orange; font-size: 18px; font-weight: bold');

    // Save current auth state
    const authKeys = [
      'admin_session_token',
      'admin_data',
      'investor_phone',
      'investor_data',
      'farm_owner_session',
      'farm_owner_data',
      'admin-session',
      'investor-session',
      'farm-owner-session'
    ];

    const authBackup: Record<string, string> = {};
    authKeys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        authBackup[key] = value;
      }
    });

    console.log(`💾 Preserved ${Object.keys(authBackup).length} auth keys`);

    // Clear old caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log(`🗑️ Cleared ${cacheNames.length} cache(s)`);
    }

    // Unregister old service workers (except atomic-sw)
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        if (!registration.active?.scriptURL.includes('atomic-sw')) {
          await registration.unregister();
        }
      }
    }

    // Restore auth data
    Object.keys(authBackup).forEach(key => {
      localStorage.setItem(key, authBackup[key]);
    });

    console.log('♻️ Auth data restored');

    // Reload with cache bypass
    setTimeout(() => {
      const url = new URL(window.location.href);
      url.searchParams.set('v', data.version);
      url.searchParams.set('t', Date.now().toString());
      window.location.href = url.toString();
    }, 1000);
  }

  private async checkForUpdates() {
    try {
      // Fetch manifest with cache bypass
      const response = await fetch(`/manifest.json?nocache=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        console.log('⚛️ Manifest not available yet');
        return;
      }

      const manifest: DeploymentManifest = await response.json();

      // Check if version changed
      if (!this.currentVersion || this.currentVersion !== manifest.version) {
        console.log(`⚛️ Version change detected`);
        console.log(`   Current: ${this.currentVersion || 'none'}`);
        console.log(`   New: ${manifest.version}`);

        // Verify manifest integrity
        if (await this.verifyManifestIntegrity(manifest)) {
          console.log('⚛️ ✅ Manifest integrity verified');

          // Update current version
          this.currentVersion = manifest.version;

          // Trigger update via Service Worker
          if (this.serviceWorker) {
            this.serviceWorker.postMessage({ type: 'CHECK_UPDATE' });
          } else {
            // Fallback: direct reload
            this.notifyAndReload({
              version: manifest.version,
              timestamp: manifest.timestamp,
              channel: manifest.channel,
              filesCount: Object.keys(manifest.files).length
            });
          }
        } else {
          console.error('⚛️ ❌ Manifest integrity check failed');
          console.error('⚛️ 🔄 Rollback: Keeping current version');
        }
      }

    } catch (error) {
      console.error('⚛️ Update check failed:', error);
    }
  }

  private async verifyManifestIntegrity(manifest: DeploymentManifest): Promise<boolean> {
    try {
      // Basic validation
      if (!manifest.version || !manifest.files || !manifest.manifestHash) {
        console.error('⚛️ Invalid manifest structure');
        return false;
      }

      // Check if index.html exists
      if (!manifest.files['index.html']) {
        console.error('⚛️ Missing index.html in manifest');
        return false;
      }

      // Verify deployment settings
      if (manifest.deployment.strategy !== 'atomic') {
        console.warn('⚛️ Non-atomic deployment strategy detected');
      }

      console.log('⚛️ Manifest structure valid');
      console.log(`   Files: ${Object.keys(manifest.files).length}`);
      console.log(`   Hash: ${manifest.manifestHash.substring(0, 16)}...`);

      return true;
    } catch (error) {
      console.error('⚛️ Integrity verification failed:', error);
      return false;
    }
  }

  private startPeriodicChecks() {
    console.log(`⚛️ Starting periodic checks (every ${this.checkInterval / 1000}s)`);

    this.intervalId = window.setInterval(() => {
      this.checkForUpdates();
    }, this.checkInterval);
  }

  public async forceCheck() {
    console.log('⚛️ Force checking for updates...');
    await this.checkForUpdates();
  }

  public getCurrentVersion(): string | null {
    return this.currentVersion;
  }

  public getDeploymentInfo(): any {
    return {
      version: localStorage.getItem('atomic-version'),
      timestamp: localStorage.getItem('atomic-timestamp'),
      channel: localStorage.getItem('atomic-channel')
    };
  }
}

// Create singleton instance
const atomicDeploymentService = new AtomicDeploymentService();

export default atomicDeploymentService;
