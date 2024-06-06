exports.handler = async function(event) {
  console.log('event:', event);
  return { statusCode: 200, body: 'Hello, CDK!' };
};
