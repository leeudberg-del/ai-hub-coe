const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, ScanCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { randomUUID } = require('crypto');

const client = DynamoDBDocumentClient.from(new DynamoDBClient({ region: 'eu-west-1' }));
const TABLE = 'ai-hub-requests';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,PATCH,OPTIONS',
};

function respond(statusCode, body) {
  return { statusCode, headers: { ...CORS, 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
}

exports.handler = async (event) => {
  const routeKey = event.routeKey || (event.httpMethod + ' ' + event.path);
  const pathParams = event.pathParameters || {};
  const rawBody = event.isBase64Encoded ? Buffer.from(event.body || '', 'base64').toString() : (event.body || '{}');

  if (routeKey === 'GET /requests') {
    const result = await client.send(new ScanCommand({ TableName: TABLE }));
    const items = (result.Items || []).sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
    return respond(200, items);
  }

  if (routeKey === 'POST /requests') {
    const body = JSON.parse(rawBody);
    const item = {
      id: randomUUID(),
      title: body.title,
      type: body.type || '',
      description: body.description,
      benefit: body.benefit || '',
      status: 'Submitted',
      submittedByName: body.submittedByName || '',
      submittedByEmail: body.submittedByEmail || '',
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await client.send(new PutCommand({ TableName: TABLE, Item: item }));
    return respond(201, item);
  }

  if (routeKey === 'PATCH /requests/{id}') {
    const id = pathParams.id;
    const body = JSON.parse(rawBody);
    await client.send(new UpdateCommand({
      TableName: TABLE,
      Key: { id },
      UpdateExpression: 'SET #s = :s, updatedAt = :u',
      ExpressionAttributeNames: { '#s': 'status' },
      ExpressionAttributeValues: { ':s': body.status, ':u': new Date().toISOString() },
    }));
    return respond(200, { id, status: body.status });
  }

  return respond(404, { error: 'Not found', routeKey });
};
