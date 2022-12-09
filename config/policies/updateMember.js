// This file is part of Coog. The COPYRIGHT file at the top level of
// this repository contains the full copyright notices and license terms.

'use strict';

/**
 * Update Strapi member from Coog
 */

// Called on /auth/local
// From config.policies in /backend/extensions/users-permissions/config/routes.json
module.exports = async (ctx, next) => {
  // Execute the action.
  await next();

  try {
    const data = ctx?.response?.body?.user;

    if (ctx?.response?.body?.error) {
      return ctx;
    } else if (!data) {
      return ctx.badRequest(
        null,
        ctx?.response?.body?.message || [
          { messages: [{ id: 'Error getting user info from Strapi.' }] },
        ]
      );
    } else if (!data?.members?.length) {
      return ctx.badRequest(null, [
        { messages: [{ id: 'Strapi user is not attached to any member.' }] },
      ]);
    }

    const members = data.members;
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

    ctx.response.body.user.members = membersList;
  } catch (e) {
    return ctx.badRequest(null, [{ messages: [{ id: e.message }] }]);
  }
};
