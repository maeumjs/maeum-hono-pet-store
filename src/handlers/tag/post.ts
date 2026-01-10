import { ApiErrorJsonSchema, ApiValidationErrorJsonSchema } from '@maeum/error-controller';
import httpStatusCodes from 'http-status-codes';

import { create } from '#/databases/repository/tag';

import type { FastifyRequest, RouteShorthandOptions } from 'fastify';

import type { IPostTagBodyDto, IPostTagQuerystringDto } from '#/dto/v1/tag/IPostTag';

export const option: RouteShorthandOptions = {
  schema: {
    tags: ['Tag'],
    summary: 'Create Tag',
    operationId: 'create-tag',
    description: 'Create Tag',
    querystring: { $ref: 'IPostTagQuerystringDto' },
    body: { $ref: 'IPostTagBodyDto' },
    response: {
      [httpStatusCodes.OK]: { $ref: 'ITagDto' },
      [httpStatusCodes.BAD_REQUEST]: ApiValidationErrorJsonSchema,
      [httpStatusCodes.INTERNAL_SERVER_ERROR]: ApiErrorJsonSchema,
    },
  },
};

export async function handler(
  req: FastifyRequest<{ Querystring: IPostTagQuerystringDto; Body: IPostTagBodyDto }>,
) {
  const tag = await create({ name: req.body.name });
  return tag;
}
