// This file is part of Coog. The COPYRIGHT file at the top level of
// this repository contains the full copyright notices and license terms.

'use strict';

const axios = require('axios');

const { getCoogSettings } = require('./utils');

/**
 * form.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */

const get = async (token, idForm) => {
  if (!token) {
    throw new Error('Token not found.');
  }
  const coogSettings = await getCoogSettings();

  // If Mock
  // coogSettings.COOG_GATEWAY_URL =
  //   'https://2ebb0a2b-315e-4152-aaea-0ea44739ab36.mock.pstmn.io';

  try {
    const response = await axios({
      method: 'GET',
      url: `${
        coogSettings.COOG_GATEWAY_URL
      }/api/v2/b2c/documents/request/token/${token}${
        idForm ? `?idForm=${idForm}` : ''
      }`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (err) {
    throw new Error(err?.response?.data?.error?.[0]?.message);
  }
};

const save = async (token, body) => {
  if (!token) {
    throw new Error('Token not found.');
  }

  const coogSettings = await getCoogSettings();

  // If Mock
  // coogSettings.COOG_GATEWAY_URL =
  //   'https://2ebb0a2b-315e-4152-aaea-0ea44739ab36.mock.pstmn.io';

  try {
    const response = await axios({
      method: 'POST',
      url: `${coogSettings.COOG_GATEWAY_URL}/api/v2/b2c/documents/request/token/${token}/answers`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: body,
    });

    return response.data;
  } catch (err) {
    throw new Error(err?.response?.data?.error?.[0]?.message);
  }
};

const uploadDocument = async (token, body) => {
  if (!token) {
    throw new Error('Token not found.');
  }

  const coogSettings = await getCoogSettings();

  // If Mock
  // coogSettings.COOG_GATEWAY_URL =
  //   'https://2ebb0a2b-315e-4152-aaea-0ea44739ab36.mock.pstmn.io';

  try {
    const response = await axios({
      method: 'POST',
      url: `${coogSettings.COOG_GATEWAY_URL}/api/v2/b2c/documents/request/token/${token}`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: body,
    });

    return response.data;
  } catch (err) {
    throw new Error(err?.response?.data?.error?.[0]?.message);
  }
};

module.exports = { get, save, uploadDocument };
