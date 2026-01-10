import { ApiErrorJsonSchema, ApiValidationErrorJsonSchema } from '@maeum/error-controller';
import httpStatusCodes from 'http-status-codes';

import { update } from '#/databases/repository/tag';

import type { FastifyRequest, RouteShorthandOptions } from 'fastify';

import type { IPutTagBodyDto, IPutTagParamsDto, IPutTagQuerystringDto } from '#/dto/v1/tag/IPutTag';

export const option: RouteShorthandOptions = {
  schema: {
    tags: ['Tag'],
    summary: 'Put Tag',
    operationId: 'put-tag',
    description: 'Put Tag',
    querystring: { $ref: 'IPutTagQuerystringDto' },
    params: { $ref: 'IPutTagParamsDto' },
    body: { $ref: 'IPutTagBodyDto' },
    response: {
      [httpStatusCodes.OK]: { $ref: 'ITagDto' },
      [httpStatusCodes.BAD_REQUEST]: ApiValidationErrorJsonSchema,
      [httpStatusCodes.INTERNAL_SERVER_ERROR]: ApiErrorJsonSchema,
    },
  },
};

export async function handler(
  req: FastifyRequest<{
    Querystring: IPutTagQuerystringDto;
    Params: IPutTagParamsDto;
    Body: IPutTagBodyDto;
  }>,
) {
  const category = await update(req.query, req.params, req.body);
  return category;
}
