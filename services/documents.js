// This file is part of Coog. The COPYRIGHT file at the top level of
// this repository contains the full copyright notices and license terms.

'use strict';

const axios = require('axios');
const PassThrough = require('stream').PassThrough;

const { getJWTToken, getCoogSettings } = require('./utils');

/**
 * documents.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */

/**
 * Get customer object by code
 * @param {string} code
 * @returns {Object} customer
 */
const getDocument = async ({ body, code }) => {
  const coogSettings = await getCoogSettings();

  const jwt = await getJWTToken(coogSettings);

  try {
    // get document
    const dataRaw = JSON.stringify({
      attachment: body?.ref,
      partyCode: code,
      extension: body?.extension,
      base64: true,
    });
    //
    const callQuery = token => ({
      method: 'POST',
      url: `${coogSettings.COOG_GATEWAY_URL}/api/v2/customer/documents/request`,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      data: dataRaw,
      responseType: 'stream',
    });
    const response = await axios(callQuery(jwt));

    return response;
  } catch (err) {
    throw new Error(err?.response?.data?.error?.[0]?.message);
  }
};

const request = async (body, user) => {
  if (!user?.code) {
    throw new Error("Connected user doesn't have a valid code...");
  }

  const documentResponse = await getDocument({ body, code: user.code });

  return {
    type: documentResponse.headers['content-type'],
    data: documentResponse?.data?.pipe(PassThrough()),
  };
};

module.exports = { request };
