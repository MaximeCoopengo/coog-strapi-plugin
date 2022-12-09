// This file is part of Coog. The COPYRIGHT file at the top level of
// this repository contains the full copyright notices and license terms.

'use strict';

const _ = require('lodash');

const { getErrorMessage } = require('../services/utils');

/**
 * CoogConnector.js controller
 *
 * @description: A set of functions called "actions" for managing `CoogConnector`.
 */
module.exports = {
  get: async ctx => {
    const settingsStore = await strapi
      .store({
        environment: '',
        type: 'plugin',
        name: 'coog-plugin',
        key: 'settings',
      })
      .get();
    const jwtTokenStore = await strapi
      .store({
        environment: '',
        type: 'plugin',
        name: 'coog-plugin',
        key: 'jwtToken',
      })
      .get();

    let coogWebToken = settingsStore?.COOG_WEB_TOKEN;
    let partial_COOG_WEB_TOKEN = '';

    if (coogWebToken) {
      if (coogWebToken.length > 10) {
        const webTknStart = coogWebToken.slice(0, 5);
        const webTknEnd = coogWebToken.slice(coogWebToken.length - 5);

        partial_COOG_WEB_TOKEN = `${webTknStart}...${webTknEnd}`;
      } else {
        partial_COOG_WEB_TOKEN = `${coogWebToken.slice(0, 3)}...`;
      }
    }

    const data = {
      COOG_GATEWAY_URL: settingsStore?.COOG_GATEWAY_URL || '',
      COOG_WEB_TOKEN: partial_COOG_WEB_TOKEN,
      HAS_JWT_TOKEN: !!jwtTokenStore?.JWT_TOKEN,
      JWT_VALID: Math.round(Date.now() / 1000) < jwtTokenStore?.JWT_EXP_TIME,
    };

    ctx.send(data);
  },

  update: async ctx => {
    if (_.isEmpty(ctx.request?.body)) {
      return ctx.badRequest(null, [
        { messages: [{ id: 'Body cannot be empty' }] },
      ]);
    }

    const fieldsToSave = ['COOG_GATEWAY_URL', 'COOG_WEB_TOKEN'];

    const storeCoog = await strapi.store({
      environment: '',
      type: 'plugin',
      name: 'coog-plugin',
      key: 'settings',
    });

    const dataCoog = await storeCoog.get();
    const cleanBody = {};

    _.forEach(fieldsToSave, field => {
      cleanBody[field] = ctx.request?.body?.[field] || dataCoog[field];
    });

    await storeCoog.set({ value: cleanBody });

    // Reset JWT token
    const storeJwtToken = await strapi.store({
      environment: '',
      type: 'plugin',
      name: 'coog-plugin',
      key: 'jwtToken',
    });

    try {
      await storeJwtToken.set({ value: {} });
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }

    ctx.send({ ok: true });
  },
};
