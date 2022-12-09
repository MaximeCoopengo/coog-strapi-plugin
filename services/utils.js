// This file is part of Coog. The COPYRIGHT file at the top level of
// this repository contains the full copyright notices and license terms.

const axios = require('axios');

/**
 * Parse JWT Token to only return data (user, iat, exp)
 * @param {string} token JWT Token to parse
 * @returns Data of JWT Token
 */
const parseJwt = token => {
  try {
    return JSON.parse(
      Buffer.from(token.split('.')[1], 'base64').toString('ascii')
    );
  } catch (e) {
    return null;
  }
};

/**
 * Get JWT token
 * @returns {string} JWT token
 */
const fetchJWTToken = async ({ COOG_GATEWAY_URL, COOG_WEB_TOKEN }) => {
  try {
    const url = `${COOG_GATEWAY_URL}/auth/token`;

    console.log('Gateway : ', COOG_GATEWAY_URL);
    console.log('Token : ', COOG_WEB_TOKEN);
    console.log('Url : ', url);

    // Get new JWT token
    const loginRes = await axios({
      method: 'POST',
      url,
      headers: { 'Content-Type': 'application/json' },
      data: { token: COOG_WEB_TOKEN },
    });

    return loginRes?.data?.access_token;
  } catch (err) {
    throw new Error(err?.response?.data?.error?.[0]?.message);
  }
};

const getJWTToken = async coogSettings => {
  const storeJwtToken = await strapi.store({
    environment: '',
    type: 'plugin',
    name: 'coog-plugin',
    key: 'jwtToken',
  });
  const dataJwtToken = await storeJwtToken.get();

  // If token exists and still valid
  if (
    dataJwtToken?.JWT_TOKEN &&
    dataJwtToken?.JWT_EXP_TIME &&
    Math.round(Date.now() / 1000) < dataJwtToken?.JWT_EXP_TIME
  ) {
    return dataJwtToken.JWT_TOKEN;
  }

  // Else request new token
  const jwt = await fetchJWTToken(coogSettings);

  try {
    if (jwt) {
      // Store it
      const objJWT = parseJwt(jwt);

      if (objJWT) {
        await storeJwtToken.set({
          value: {
            JWT_TOKEN: jwt,
            JWT_EXP_TIME: parseInt(objJWT.exp),
          },
        });
      }
    }
  } catch (err) {
    throw new Error(getErrorMessage(err));
  }

  return jwt;
};

/**
 * Get Coog Settings
 * @param {string} code
 * @returns {Object} Coog Settings
 */
const getCoogSettings = async () => {
  const coogSettings = await strapi
    .store({
      environment: '',
      type: 'plugin',
      name: 'coog-plugin',
      key: 'settings',
    })
    .get();

  if (!coogSettings?.COOG_GATEWAY_URL || !coogSettings?.COOG_WEB_TOKEN) {
    throw new Error('Please configure CoogConnector on your admin panel');
  }

  return coogSettings;
};

const getErrorMessage = err => {
  if (err?.response?.data?.error?.[0]?.message) {
    return err.response.data.error[0].message;
  }

  if (err?.response?.data?.errors?.[0]?.message) {
    return err.response.data.errors[0].message;
  }

  if (err?.response?.data?.message) {
    return err.response.data.message;
  }

  if (err?.response?.data) {
    return err.response.data;
  }

  return err;
};

module.exports = { getJWTToken, getCoogSettings, getErrorMessage };
