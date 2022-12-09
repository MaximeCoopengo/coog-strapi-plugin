// This file is part of Coog. The COPYRIGHT file at the top level of
// this repository contains the full copyright notices and license terms.

'use strict';

const _ = require('lodash');

/**
 * Member.js controller
 *
 * @description: A set of functions called "actions" for managing `Member`.
 */
module.exports = {
  /**
   * Update specific member
   *
   * @return {Object}
   */
  updateById: async ctx => {
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
      const memberToUpdate = _.find(members, { id: parseInt(ctx.params.id) });

      if (!memberToUpdate) {
        return ctx.badRequest(null, [
          { messages: [{ id: 'You can not update this member.' }] },
        ]);
      }

      const member = await strapi.plugins[
        'coog-plugin'
      ].services.member.updateById(
        memberToUpdate,
        ctx.request?.body,
        ctx.params.part
      );

      return member;
    } catch (e) {
      return ctx.badRequest(null, [{ messages: [{ id: e.message }] }]);
    }
  },
};
