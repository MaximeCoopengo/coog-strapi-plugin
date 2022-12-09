// This file is part of Coog. The COPYRIGHT file at the top level of
// this repository contains the full copyright notices and license terms.

'use strict';

const _ = require('lodash');

/**
 * Payment.js controller
 *
 * @description: A set of functions called "actions" for managing `Payment`.
 */
module.exports = {
  /**
   * Create payment
   *
   * @return {Object}
   */
  create: async ctx => {
    try {
      const listPayments = ['paybox', 'monetico'];
      const paymentMethod = ctx.params.method;

      if (!_.includes(listPayments, paymentMethod)) {
        return ctx.badRequest(null, [
          { messages: [{ id: 'Payment method not allowed.' }] },
        ]);
      }

      const payment = await strapi.plugins[
        'coog-plugin'
      ].services.payment.create(ctx.params.method, ctx.request?.body);
      return payment;
    } catch (e) {
      return ctx.badRequest(null, e);
    }
  },
};
