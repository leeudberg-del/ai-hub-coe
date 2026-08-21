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
      region: body.region || 'Global',
      status: 'Submitted',
      submittedByName: body.submittedByName || '',
      submittedByEmail: body.submittedByEmail || '',
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await client.send(new PutCommand({ TableName: TABLE, Item: item }));
    return respond(201, item);
  }

  if (routeKey === 'POST /requests/{id}/vote') {
    const id = pathParams.id;
    const body = JSON.parse(rawBody || '{}');
    const increment = body.decrement ? -1 : 1;

    const result = await client.send(new UpdateCommand({
      TableName: TABLE,
      Key: { id },
      UpdateExpression: 'ADD upvotes :inc SET updatedAt = :u',
      ExpressionAttributeValues: { ':inc': increment, ':u': new Date().toISOString() },
      ReturnValues: 'ALL_NEW',
    }));
    return respond(200, { id, upvotes: Math.max(0, result.Attributes?.upvotes || 0) });
  }

  if (routeKey === 'PATCH /requests/{id}') {
    const id = pathParams.id;
    const body = JSON.parse(rawBody);

    const allowedKeys = [
      'status',
      'triageOutcome',
      'triageReason',
      'triageChecklist',
      'discoveryNotes',
      'userStory',
      'acceptanceCriteria',
      'sizing',
      'priority',
      'assignedLead'
    ];

    const expressions = ['updatedAt = :u'];
    const names = {};
    const values = { ':u': new Date().toISOString() };

    allowedKeys.forEach(k => {
      if (body[k] !== undefined) {
        expressions.push(`#${k} = :${k}`);
        names[`#${k}`] = k;
        values[`:${k}`] = body[k];
      }
    });

    await client.send(new UpdateCommand({
      TableName: TABLE,
      Key: { id },
      UpdateExpression: `SET ${expressions.join(', ')}`,
      ExpressionAttributeNames: Object.keys(names).length > 0 ? names : undefined,
      ExpressionAttributeValues: values,
    }));
    return respond(200, { id, ...body });
  }

  return respond(404, { error: 'Not found', routeKey });
};
