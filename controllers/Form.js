// This file is part of Coog. The COPYRIGHT file at the top level of
// this repository contains the full copyright notices and license terms.

'use strict';

const _ = require('lodash');

/**
 * Form.js controller
 *
 * @description: A set of functions called "actions" for managing `Form`.
 */
module.exports = {
  /**
   * Retrieve data for Medical/RGPD Survey and Documents
   *
   * @return {Object}
   */
  requestToken: async ctx => {
    try {
      const response = await strapi.plugins['coog-plugin'].services.form.get(
        ctx?.params?.token,
        ctx?.query?.idForm
      );

      return response;
    } catch (e) {
      return ctx.badRequest(null, [{ messages: [{ id: e.message }] }]);
    }
  },

  /**
   * Send answers for Medical/RGPD Survey
   *
   * @return {Object}
   */
  answersToken: async ctx => {
    try {
      const body = ctx.request?.body;

      if (_.isEmpty(body)) {
        return ctx.badRequest(null, [
          { messages: [{ id: 'Body cannot be empty.' }] },
        ]);
      }

      const response = await strapi.plugins['coog-plugin'].services.form.save(
        ctx?.params?.token,
        body
      );

      return response;
    } catch (e) {
      return ctx.badRequest(null, [{ messages: [{ id: e.message }] }]);
    }
  },

  /**
   * Send document
   *
   * @return {Object}
   */
  uploadToken: async ctx => {
    try {
      const body = ctx.request?.body;

      if (_.isEmpty(body)) {
        return ctx.badRequest(null, [
          { messages: [{ id: 'Body cannot be empty.' }] },
        ]);
      }

      const response = await strapi.plugins[
        'coog-plugin'
      ].services.form.uploadDocument(ctx?.params?.token, body);

      return response;
    } catch (e) {
      return ctx.badRequest(null, [{ messages: [{ id: e.message }] }]);
    }
  },
};
