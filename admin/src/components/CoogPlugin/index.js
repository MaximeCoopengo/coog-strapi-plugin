// This file is part of Coog. The COPYRIGHT file at the top level of
// this repository contains the full copyright notices and license terms.

import React, { Component } from "react";
import _ from "lodash";

import {
  BaselineAlignment,
  FormBloc,
  SettingsPageTitle,
  SizedInput,
  request,
} from "strapi-helper-plugin";
import { Header } from "@buffetjs/custom";
import { AlignedButton } from "./components";

class CoogPlugin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      COOG_GATEWAY_URL: "",
      COOG_WEB_TOKEN: "",
      placeholderWebToken: "",
      HAS_JWT_TOKEN: false,
      JWT_VALID: false,
      dirty: {},
      testConnection: false,
      isLoading: false,
      isSaving: false,
      isTesting: false,
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.loadSettings = this.loadSettings.bind(this);
    this.onTestConnection = this.onTestConnection.bind(this);
  }

  handleChange = (event) => {
    const newState = { dirty: { ...this.state.dirty } };

    newState[event.target.name] = event.target.value;
    newState.dirty[event.target.name] = true;

    this.setState(newState);
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    this.setState({ isSaving: true });

    try {
      const { COOG_GATEWAY_URL, COOG_WEB_TOKEN, dirty } = this.state;

      const body = {};

      if (dirty.COOG_GATEWAY_URL) {
        body.COOG_GATEWAY_URL = COOG_GATEWAY_URL;
      }
      if (dirty.COOG_WEB_TOKEN) {
        body.COOG_WEB_TOKEN = COOG_WEB_TOKEN;
      }

      // Save
      await request("/coog-plugin/settings", { method: "PATCH", body });

      // Reload data
      await this.loadSettings();

      strapi.notification.toggle({
        type: "success",
        message: "Settings aved with success!",
      });
    } catch (error) {
      console.log(error);

      strapi.notification.toggle({
        type: "warning",
        message: "Error while saving settings!",
      });
    }

    this.setState({ isSaving: false });
  };

  loadSettings = async () => {
    this.setState({ isLoading: true });
    try {
      const data = await request("/coog-plugin/settings", {
        method: "GET",
      });

      this.setState({
        COOG_GATEWAY_URL: data.COOG_GATEWAY_URL,
        COOG_WEB_TOKEN: "",
        placeholderWebToken: data.COOG_WEB_TOKEN,
        HAS_JWT_TOKEN: data.HAS_JWT_TOKEN,
        JWT_VALID: data.JWT_VALID,
        dirty: {},
      });
    } catch (error) {
      console.log(error);

      strapi.notification.toggle({
        type: "warning",
        message: "Error while loading settings!",
      });
    }

    this.setState({ isLoading: false });
  };

  onTestConnection = async () => {
    this.setState({ isTesting: true });

    try {
      const data = await request("/coog-plugin/customer/1", { method: "GET" });

      if (data?.personalInfo?.id === "1") {
        this.setState({ testConnection: true });

        await this.loadSettings();

        strapi.notification.toggle({
          type: "success",
          message: "Connection with Coog is working!",
        });
      } else {
        this.setState({ testConnection: false });

        strapi.notification.toggle({
          type: "warning",
          message:
            "Connection with Coog seems bad. Check your settings and try again.",
        });
      }
    } catch (error) {
      console.log(error);
      this.setState({ testConnection: false });

      strapi.notification.toggle({
        type: "warning",
        message:
          "Connection with Coog is not working. Check your settings and try again.",
      });
    }

    this.setState({ isTesting: false });
  };

  componentDidMount() {
    this.loadSettings();
  }

  render() {
    const {
      COOG_GATEWAY_URL,
      COOG_WEB_TOKEN,
      HAS_JWT_TOKEN,
      JWT_VALID,
      placeholderWebToken,
      dirty,
      isLoading,
      isSaving,
      isTesting,
      testConnection,
    } = this.state;

    const title = "Coog Connector Admin";

    return (
      <>
        <SettingsPageTitle name={title} />
        <Header
          title={{ label: title }}
          content="Configure and test the CoogConnector plugin"
          size={{ xs: 12 }}
          isLoading={isLoading}
        />
        <BaselineAlignment top size="3px" />
        <form onSubmit={this.handleSubmit}>
          <FormBloc title="Configuration" isLoading={isLoading}>
            <SizedInput
              label="Gateway URL"
              name="COOG_GATEWAY_URL"
              size={{ xs: 12 }}
              type="text"
              value={COOG_GATEWAY_URL}
              onChange={this.handleChange}
            />
            <SizedInput
              label="Web Token"
              name="COOG_WEB_TOKEN"
              size={{ xs: 12 }}
              type="text"
              value={COOG_WEB_TOKEN}
              placeholder={placeholderWebToken}
              onChange={this.handleChange}
            />
            <AlignedButton
              type="submit"
              label="Save"
              name="submitSettings"
              isLoading={isSaving}
              disabled={_.isEmpty(dirty)}
            />
          </FormBloc>
        </form>

        <BaselineAlignment top size="32px" />
        <FormBloc title="JWT Token Informations" isLoading={isLoading}>
          <SizedInput
            disabled
            label="Has JWT"
            name="HAS_JWT_TOKEN"
            type="bool"
            size={{ xs: 6 }}
            value={HAS_JWT_TOKEN}
          />
          <SizedInput
            disabled
            label="Is JWT valid"
            name="JWT_VALID"
            type="bool"
            size={{ xs: 6 }}
            value={JWT_VALID}
            style="pointer-events: none"
          />
        </FormBloc>

        <BaselineAlignment top size="32px" />
        <FormBloc title="Coog Connection">
          <AlignedButton
            label="Test"
            name="test-connection"
            onClick={this.onTestConnection}
            isLoading={isTesting}
            color={testConnection ? "success" : "primary"}
          />
        </FormBloc>
      </>
    );
  }
}

export default CoogPlugin;
