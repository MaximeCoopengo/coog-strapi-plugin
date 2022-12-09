// This file is part of Coog. The COPYRIGHT file at the top level of
// this repository contains the full copyright notices and license terms.

'use strict';

const _ = require('lodash');

/**
 * user.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 * @return [user, error]
 */

const decodeToken = (token, onlyValidate = false) => {
  if (token === null || token === undefined || typeof token !== 'string') {
    return false;
  }

  try {
    const plainToken = Buffer.from(token, 'base64').toString('ascii');

    if (!plainToken) {
      return false;
    }

    const dataToken = plainToken.split(',');

    if (dataToken.length !== 6) {
      return false;
    }

    return onlyValidate ? true : dataToken;
  } catch (e) {
    console.log(e.stack);
    return false;
  }
};

const validateToken = token => decodeToken(token, true);

const create = async ({ inviteToken, ...userProfile } = {}) => {
  try {
    // Tests:
    // New user, new member
    // New user, member exists not linked
    // User exists, new member
    // User exists, member exists not linked

    // Should be errors:
    // User exists, member exists linked
    // Login, no user
    // Login, user without member

    // Invite Token example:
    // coogId, Contract ID, Dist Network, Exp Date, transaction ID, email
    // 2929,C1,1212,20221231,123abcd,test@mail.fr

    // Check if user already exists
    let user = await strapi
      .query('user', 'users-permissions')
      .findOne({ email: userProfile.email });

    // Got an Invite Token, so will create/update User and Member
    if (inviteToken) {
      const plainToken = await strapi.plugins[
        'coog-plugin'
      ].services.user.decodeToken(inviteToken);

      if (!plainToken) {
        return [null, { message: 'Token is invalid.' }];
      }

      const [coogId, contractId, distNetwork, expDate, transId, emailMember] =
        plainToken;

      // Get member from CoogID
      const member = (await strapi.query('member').findOne({ coogId })) || {};

      // If no Strapi User but Member already exists and is linked to a User
      // or if Strapi User and Member already exists but Member is linked to another User
      if (
        (!user && member.user) ||
        (user && member?.user && member.user.id !== user.id)
      ) {
        return [null, { message: 'Not authorized', inviteToken }];
      }

      // Strapi User already exists
      if (user) {
        // Check if a member already exists on the dist_network
        const sameDistNetwork = _.some(user.members, {
          data: { personalInfo: { dist_network: distNetwork } },
        });

        if (sameDistNetwork) {
          return [
            null,
            {
              message: 'A member already exists on this distribution channel',
              inviteToken,
            },
          ];
        }
      } else {
        // Create Srapi User
        user = await strapi.plugins['users-permissions'].services.user.add(
          userProfile
        );
      }

      const newMember = {
        coogId,
        ...member,
        user: member?.user?.id || user.id,
      };

      // Add the Member if it's a new or if it's not already linked to the User
      if (!newMember.id || !_.find(user.members, { id: newMember.id })) {
        user.members.push(newMember);
      }
    } else if (!user || !user.members?.length) {
      // If User doesn't exist (and no inviteToken)
      // or if there's no Member linked to the User
      return [null, { message: 'Not authorized' }];
    }

    const newMembers = [];

    // Update (new and old) Members from Coog
    for (let i = 0; i < user.members.length; i++) {
      const member = user.members[i];

      // Get Coog member data
      const coogMember = await strapi.plugins[
        'coog-plugin'
      ].services.coog.fetch({
        code: member.coogId,
      });

      // Add/Update Strapi member
      const newMember = await strapi.plugins[
        'coog-plugin'
      ].services.member.createOrUpdate(member, coogMember);

      newMembers.push(newMember);
    }

    user.members = newMembers;

    return [_.omit(user, ['password']), null];
  } catch (e) {
    console.error(e);
    return [null, { message: 'Login error.', inviteToken }];
  }
};

module.exports = { create, validateToken, decodeToken };
