import React from 'react';
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';

interface PerformanceExampleProps {
  componentName?: string;
  threshold?: number;
  trackMemory?: boolean;
}

const PerformanceExample: React.FC<PerformanceExampleProps> = ({
  componentName = 'PerformanceExample',
  threshold = 100,
  trackMemory = false,
}) => {
  // Initialize performance monitoring
  const { metrics, getSlowOperations, clearMetrics, isMonitoring } =
    usePerformanceMonitor(componentName, {
      threshold,
      trackSlowRenders: true,
      trackMemoryUsage: trackMemory,
      enabled: true,
      sampleRate: 1.0, // Monitor 100% of users
    });

  // Simulate some work to test performance monitoring
  const simulateWork = () => {
    const start = performance.now();

    // Simulate heavy computation
    let result = 0;
    for (let i = 0; i < 1000000; i++) {
      result += Math.random();
    }

    const end = performance.now();
    const duration = end - start;

    // Create a performance measure
    performance.mark('work-start');
    performance.mark('work-end');
    performance.measure('simulated-work', 'work-start', 'work-end');

    return { result, duration };
  };

  const handleSimulateWork = () => {
    const { result, duration } = simulateWork();
    console.log(
      `Work completed in ${duration.toFixed(2)}ms, result: ${result.toFixed(2)}`
    );
  };

  const handleClearMetrics = () => {
    clearMetrics();
    console.log('Performance metrics cleared');
  };

  return (
    <div
      style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}
    >
      <h3>Performance Monitor Example</h3>

      <div style={{ marginBottom: '20px' }}>
        <p>
          <strong>Component:</strong> {componentName}
        </p>
        <p>
          <strong>Monitoring:</strong>{' '}
          {isMonitoring ? '✅ Active' : '❌ Inactive'}
        </p>
        <p>
          <strong>Threshold:</strong> {threshold}ms
        </p>
        <p>
          <strong>Memory Tracking:</strong>{' '}
          {trackMemory ? '✅ Enabled' : '❌ Disabled'}
        </p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={handleSimulateWork}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Simulate Heavy Work
        </button>

        <button
          onClick={handleClearMetrics}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Clear Metrics
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>Performance Metrics ({metrics.length} total)</h4>
        {metrics.length === 0 ? (
          <p style={{ color: '#6c757d' }}>
            No metrics recorded yet. Try simulating some work!
          </p>
        ) : (
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {metrics.map((metric, index) => (
              <div
                key={index}
                style={{
                  padding: '8px',
                  margin: '4px 0',
                  backgroundColor:
                    metric.severity === 'critical' ? '#f8d7da' : '#fff3cd',
                  border: `1px solid ${metric.severity === 'critical' ? '#f5c6cb' : '#ffeaa7'}`,
                  borderRadius: '4px',
                  fontSize: '12px',
                }}
              >
                <strong>{metric.name}</strong> ({metric.type}) -{' '}
                {metric.duration.toFixed(2)}ms
                {metric.severity && (
                  <span
                    style={{
                      marginLeft: '8px',
                      padding: '2px 6px',
                      backgroundColor:
                        metric.severity === 'critical' ? '#dc3545' : '#ffc107',
                      color: metric.severity === 'critical' ? 'white' : 'black',
                      borderRadius: '3px',
                      fontSize: '10px',
                    }}
                  >
                    {metric.severity}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h4>Slow Operations ({getSlowOperations().length})</h4>
        {getSlowOperations().length === 0 ? (
          <p style={{ color: '#6c757d' }}>No slow operations detected.</p>
        ) : (
          <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
            {getSlowOperations().map((operation, index) => (
              <div
                key={index}
                style={{
                  padding: '8px',
                  margin: '4px 0',
                  backgroundColor: '#f8d7da',
                  border: '1px solid #f5c6cb',
                  borderRadius: '4px',
                  fontSize: '12px',
                }}
              >
                <strong>{operation.name}</strong> -{' '}
                {operation.duration.toFixed(2)}ms
                <span
                  style={{
                    marginLeft: '8px',
                    padding: '2px 6px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    borderRadius: '3px',
                    fontSize: '10px',
                  }}
                >
                  {operation.severity}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {process.env.NODE_ENV === 'development' && (
        <div
          style={{
            marginTop: '20px',
            padding: '10px',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px',
          }}
        >
          <h5>Development Info</h5>
          <p>Performance data is being sent to analytics in production.</p>
          <p>Check the browser console for detailed performance information.</p>
        </div>
      )}
    </div>
  );
};

export default PerformanceExample;
