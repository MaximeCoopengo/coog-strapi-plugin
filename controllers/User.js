// This file is part of Coog. The COPYRIGHT file at the top level of
// this repository contains the full copyright notices and license terms.

'use strict';

const _ = require('lodash');

/**
 * User.js controller
 *
 * @description: A set of functions called "actions" for managing `User`.
 */
module.exports = {
  /**
   * Create or update a Strapi user.
   *
   * @return {Object}
   */
  create: async ctx => {
    try {
      const body = ctx.request?.body;

      if (_.isEmpty(body)) {
        return ctx.badRequest(null, [
          { messages: [{ id: 'Body cannot be empty.' }] },
        ]);
      } else if (body.code == null || body.code === '') {
        return ctx.badRequest(null, [
          { messages: [{ id: 'Body should have an invite token.' }] },
        ]);
      } else if (
        body.password == null ||
        body.password == '' ||
        body.passwordConfirmation === null ||
        body.passwordConfirmation === ''
      ) {
        return ctx.badRequest(null, [
          { messages: [{ id: 'Body should have a password.' }] },
        ]);
      } else if (body.password !== body.passwordConfirmation) {
        return ctx.badRequest(null, [
          { messages: [{ id: 'Passwords should be the same.' }] },
        ]);
      }

      const plainToken = await strapi.plugins[
        'coog-plugin'
      ].services.user.decodeToken(body.code);

      if (!plainToken) {
        return ctx.badRequest(null, [
          { messages: [{ id: 'Token is invalid.' }] },
        ]);
      }

      const [coogId, contractId, distNetwork, expDate, transId, emailMember] =
        plainToken;

      const advanced = await strapi
        .store({
          environment: '',
          type: 'plugin',
          name: 'users-permissions',
          key: 'advanced',
        })
        .get();

      // Can register
      if (!advanced.allow_register) {
        return ctx.badRequest(null, [
          { messages: [{ id: 'Register action is actually not available.' }] },
        ]);
      }

      // Check if user already exists
      const user = await strapi
        .query('user', 'users-permissions')
        .findOne({ email: emailMember });

      // Email is unique on all providers
      if (user && user.provider !== 'local' && advanced.unique_email) {
        return ctx.badRequest(null, [
          { messages: [{ id: 'Email is already taken.' }] },
        ]);
      }

      // Get member from CoogID
      const member = (await strapi.query('member').findOne({ coogId })) || {};

      // If Member already exists and is linked to a User
      if (member?.user != null) {
        return ctx.badRequest(null, [
          { messages: [{ id: 'Bad token or already used.' }] },
        ]);
      }

      // Retrieve default role
      const defaultRole = await strapi
        .query('role', 'users-permissions')
        .findOne({ type: advanced.default_role }, []);

      const params = {
        provider: 'local',
        role: defaultRole.id,
        confirmed: true,
        username: emailMember,
        email: emailMember,
        password: body.password,
        inviteToken: body.code,
      };

      const [createdUser, errorCreate] = await strapi.plugins[
        'coog-plugin'
      ].services.user.create(params);

      if (errorCreate) {
        return ctx.badRequest(null, { messages: [errorCreate] });
      }

      return _.omit(createdUser, ['password']);
    } catch (e) {
      return ctx.badRequest(null, [{ messages: [{ id: e.message }] }]);
    }
  },

  /**
   * Get URL to redirect user for account activation.
   *
   * @return {Object}
   */
  redirect: async ctx => {
    try {
      const body = ctx.request?.body;

      if (_.isEmpty(body)) {
        return ctx.badRequest(null, [
          { messages: [{ id: 'Body cannot be empty.' }] },
        ]);
      } else if (body?.inviteToken == null || body?.inviteToken === '') {
        return ctx.badRequest(null, [
          { messages: [{ id: 'Body should have an invite token.' }] },
        ]);
      }

      const plainToken = await strapi.plugins[
        'coog-plugin'
      ].services.user.decodeToken(body.inviteToken);

      if (!plainToken) {
        return ctx.badRequest(null, [
          { messages: [{ id: 'Token is invalid.' }] },
        ]);
      }

      const [coogId, contractId, distNetwork, expDate, transId, emailMember] =
        plainToken;

      // Get member from CoogID
      const member = await strapi.query('member').findOne({ coogId });

      // If Member already exists and is linked to a User
      if (member?.user != null) {
        return ctx.badRequest(null, [
          { messages: [{ id: 'Token is invalid or have already been used.' }] },
        ]);
      }

      const store = await strapi.store({
        environment: '',
        type: 'plugin',
        name: 'users-permissions',
      });

      let url;
      const providerList = await store.get({ key: 'grant' });

      // TODO: Better detection of provider used ?
      if (providerList?.auth0?.enabled) {
        url = 'login';
      } else if (providerList?.email?.enabled) {
        // Check if user already exists
        const user = await strapi
          .query('user', 'users-permissions')
          .findOne({ email: emailMember });

        if (user) {
          url = 'login';
        } else {
          url = 'account/create';
        }
      } else {
        return ctx.badRequest(null, 'No supported provider are enabled.');
      }

      return { url: `${url}?inviteToken=${body.inviteToken}` };
    } catch (e) {
      return ctx.badRequest(null, [{ messages: [{ id: e.message }] }]);
    }
  },

  /**
   * Check if token is valid
   *
   * @return {Object}
   */
  validateToken: async ctx => {
    try {
      const isValid = await strapi.plugins[
        'coog-plugin'
      ].services.user.validateToken(ctx.params.token);
      return { isValid };
    } catch (e) {
      return ctx.badRequest(null, [{ messages: [{ id: e.message }] }]);
    }
  },
};
