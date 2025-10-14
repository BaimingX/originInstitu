module.exports = async function (context, req) {
  try {
    context.log('Health check endpoint called');

    const healthData = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV || 'undefined',
        LOCAL_EXAMPLE_HTML: process.env.LOCAL_EXAMPLE_HTML || 'undefined',
        functionRuntime: process.version
      },
      dependencies: {
        fetch: typeof fetch !== 'undefined',
        hasConsole: typeof console !== 'undefined'
      },
      platform: {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version
      }
    };

    context.log('Health check successful:', healthData);

    context.res = {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(healthData, null, 2)
    };

  } catch (error) {
    context.log.error('Health check failed:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    context.res = {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        status: 'error',
        timestamp: new Date().toISOString(),
        error: {
          name: error.name,
          message: error.message
        }
      }, null, 2)
    };
  }
};