// This file is part of Coog. The COPYRIGHT file at the top level of
// this repository contains the full copyright notices and license terms.

'use strict';

const axios = require('axios');

const { getJWTToken, getCoogSettings } = require('./utils');
const { APIError, TextError } = require('./error');

/**
 * form.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */

const create = async (method, data) => {
  if (!method) {
    throw new TextError('Payment method not found.');
  }

  const coogSettings = await getCoogSettings();
  const jwt = await getJWTToken(coogSettings);

  try {
    const response = await axios({
      method: 'POST',
      url: `${coogSettings.COOG_GATEWAY_URL}/api/v2/customer/payment/${method}`,
      headers: {
        Authorization: `Bearer ${jwt}`,
        'Content-Type': 'application/json',
      },
      data,
    });

    return response.data;
  } catch (err) {
    throw new APIError(err?.response?.data?.error?.[0]);
  }
};

module.exports = { create };
