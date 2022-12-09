// This file is part of Coog. The COPYRIGHT file at the top level of
// this repository contains the full copyright notices and license terms.

'use strict';

const _ = require('lodash');

/**
 * Customer.js controller
 *
 * @description: A set of functions called "actions" for managing `Customer`.
 */
module.exports = {
  /**
   * Retrieve the connected customer.
   *
   * @return {Object}
   */
  find: async ctx => {
    try {
      const userFull = await strapi
        .query('user', 'users-permissions')
        .findOne({ id: ctx?.state?.user?.id });

      if (!userFull?.members?.length) {
        return ctx.badRequest(null, [
          { messages: [{ id: 'Strapi user is not attached to any member.' }] },
        ]);
      }

      const members = userFull.members;
      const membersList = [];

      for (let i = 0; i < members.length; i++) {
        let member = members[i];

        if (member?.data?.personalInfo?.code) {
          // Get Coog member data
          const coogMember = await strapi.plugins[
            'coog-plugin'
          ].services.coog.fetch({ code: member.data.personalInfo.code });

          // Add/Update strapi member and update strapi user
          const updatedMember = await strapi.plugins[
            'coog-plugin'
          ].services.member.createOrUpdate(member, coogMember);

          membersList.push(updatedMember);
        }
      }

      return membersList;
    } catch (e) {
      return ctx.badRequest(null, [{ messages: [{ id: e.message }] }]);
    }
  },

  /**
   * Retrieve the customer by code.
   *
   * @return {Object}
   */
  findByCode: async ctx => {
    try {
      return await strapi.plugins['coog-plugin'].services.coog.fetchByCode(ctx);
    } catch (e) {
      return ctx.badRequest(null, [{ messages: [{ id: e.message }] }]);
    }
  },

  /**
   * Retrieve the document by ref.
   *
   * @return {Object}
   */
  documentsRequest: async ctx => {
    try {
      if (_.isEmpty(ctx.request?.body)) {
        return ctx.badRequest(null, [
          { messages: [{ id: 'Body cannot be empty' }] },
        ]);
      } else if (ctx.request?.body?.ref == null) {
        return ctx.badRequest(null, [
          { messages: [{ id: 'Body should have a ref' }] },
        ]);
      }

      const response = await strapi.plugins[
        'coog-plugin'
      ].services.documents.request(ctx.request?.body, ctx.state?.user);

      ctx.type = response.type;

      return response.data;
    } catch (e) {
      return ctx.badRequest(null, [{ messages: [{ id: e.message }] }]);
    }
  },
};
