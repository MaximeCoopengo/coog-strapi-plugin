// This file is part of Coog. The COPYRIGHT file at the top level of
// this repository contains the full copyright notices and license terms.

'use strict';

const { compact, map, omit, reduce } = require('lodash');
const axios = require('axios');
const { sanitizeEntity } = require('strapi-utils');
const moment = require('moment');

const { getJWTToken, getCoogSettings } = require('./utils');

/**
 * member.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */

const updateMember = async (memberId, coogMember) => {
  return await strapi.services.member.update({ id: memberId }, coogMember);
};

const createMember = async coogMember => {
  return await strapi.services.member.create(coogMember);
};

const sanitizeMember = member => {
  const sanitizedMember = sanitizeEntity(member, {
    model: strapi.models.member,
  });

  sanitizedMember.user = sanitizedMember.user.id;

  return sanitizedMember;
};

const sanitizeCoogMember = coogMember => {
  const cleanCoogMember = {
    ...coogMember,
    personalInfo: omit(coogMember?.personalInfo || {}, ['id', 'relations']),
    // TODO: sanitize the following data
    data: coogMember || {},
    contracts: Array.isArray(coogMember?.contracts) ? coogMember.contracts : [],
    documents: Array.isArray(coogMember?.documents) ? coogMember.documents : [],
  };

  if (cleanCoogMember?.personalInfo?.gender) {
    const gender = cleanCoogMember.personalInfo.gender;

    if (!gender.code && !gender.prefix && !gender.shortprefix) {
      cleanCoogMember.personalInfo.gender = null;
    }
  }

  return cleanCoogMember;
};

const createOrUpdate = async (member, coogMember) => {
  try {
    let memberObj;
    let newMember;
    const cleanCoogMember = sanitizeCoogMember(coogMember);
    const cleanCoogMemberWithUser = {
      ...cleanCoogMember,
      user: member.user,
      coogId: cleanCoogMember?.data?.personalInfo?.code,
    };

    if (member.id != null) {
      memberObj = await strapi.services.member.findOne({
        id: member.id,
      });
    }

    if (memberObj) {
      newMember = await updateMember(member.id, cleanCoogMemberWithUser);
    } else {
      newMember = await createMember(cleanCoogMemberWithUser);
    }

    if (!newMember) {
      throw new Error('Error when updating/creating member in database.');
    }

    return sanitizeMember(newMember);
  } catch (e) {
    console.error(e);
    throw new Error('Error when updating/creating member in database.');
  }
};

const transformContactBody = (data, coogId) => {
  const body = {
    party: { code: coogId },
    new_contact_mechanisms: compact(
      map(data, (value, key) => {
        if (value !== null && value !== undefined && value !== '') {
          return { type: key, values: [value] };
        }

        return null;
      })
    ),
  };

  return body;
};

const transformAddressBody = (data, coogId) => {
  const body = {
    party: { code: coogId },
    new_addresses: [data],
    date: moment().format('YYYY-MM-DD'),
  };

  return body;
};

const updateById = async (memberToUpdate, data, part) => {
  const coogSettings = await getCoogSettings();
  const jwt = await getJWTToken(coogSettings);

  let url;
  let body;

  switch (part) {
    case 'contact':
      url = `${coogSettings.COOG_GATEWAY_URL}/api/v2/parties/actions/request_change_contact_informations`;
      body = transformContactBody(data, memberToUpdate.coogId);
      break;
    case 'address':
      url = `${coogSettings.COOG_GATEWAY_URL}/api/v2/parties/actions/request_change_address`;
      body = transformAddressBody(data, memberToUpdate.coogId);
      break;
    default:
      console.log('TODO: Specific update for ', part);
      throw new Error('This action is not implemented yet.');
  }

  const response = await axios({
    method: 'POST',
    url,
    headers: {
      Authorization: `Bearer ${jwt}`,
      'Content-Type': 'application/json',
    },
    data: body,
  });

  if (
    response?.data?.endorsements?.length &&
    reduce(
      response.data.endorsements,
      (acc, end) => acc && end?.state === 'applied',
      true
    )
  ) {
    const coogMember = await strapi.plugins['coog-plugin'].services.coog.fetch({
      code: memberToUpdate.coogId,
    });

    // Update strapi member
    const updatedMember = await strapi.plugins[
      'coog-plugin'
    ].services.member.createOrUpdate(memberToUpdate, coogMember);

    return updatedMember;
  }

  throw new Error('Modifications have not been applied.');
};

module.exports = { createOrUpdate, updateById };
