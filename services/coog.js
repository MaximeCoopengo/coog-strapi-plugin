// This file is part of Coog. The COPYRIGHT file at the top level of
// this repository contains the full copyright notices and license terms.

'use strict';

const _ = require('lodash');
const axios = require('axios');

const { getJWTToken, getCoogSettings, getErrorMessage } = require('./utils');

/**
 * coog.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */

/**
 * Get member object by code
 * @param {string} code
 * @returns {Object} member
 */
const fetchCoogCustomer = async ({ code }) => {
  const coogSettings = await getCoogSettings();
  const coogPluginData = await strapi.services['coog-settings'].find();

  if (!coogPluginData?.queries) {
    throw new Error('Please configure Coog Settings in Single Type');
  }

  const jwt = await getJWTToken(coogSettings);

  try {
    console.log('Code party : ', code);

    const getCustomerInfosQuery = _.filter(coogPluginData.queries, {
      code: 'getCustomerInfos',
    })[0];

    if (!getCustomerInfosQuery) {
      throw new Error(
        'Please provide a query for getCustomerInfos on your admin panel'
      );
    }

    // get customer data
    const dataRaw = JSON.stringify({
      query: getCustomerInfosQuery.query,
      variables: {},
    });
    //
    const callQuery = token => ({
      method: 'POST',
      url: `${coogSettings.COOG_GATEWAY_URL}/api/v2/customer/graphql/customer/${code}`,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      data: dataRaw,
    });
    const response = await axios(callQuery(jwt));

    return response?.data?.data;
  } catch (err) {
    throw new Error(getErrorMessage(err));
  }
};

const fetch = async user => {
  if (!user?.code) {
    throw new Error("Connected user doesn't have a valid code...");
  }

  const coogMember = await fetchCoogCustomer({ code: user.code });

  return coogMember;
};

const fetchByCode = async ctx => {
  const coogMember = await fetchCoogCustomer({ code: ctx.params.code });

  return coogMember;
};

module.exports = { fetch, fetchByCode };
