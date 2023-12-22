/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  LitElement,
  html,
  TemplateResult,
  css,
  PropertyValues,
  CSSResultGroup,
} from 'lit';
import { property, state } from "lit/decorators";
import {
  HomeAssistant,
  hasConfigOrEntityChanged,
  hasAction,
  ActionHandlerEvent,
  handleAction,
  LovelaceCardEditor,
  getLovelace,
} from 'custom-card-helpers'; // This is a community maintained npm module with common helper functions/types. https://github.com/custom-cards/custom-card-helpers
import { CARD_VERSION } from './constants';
import './editor';

import type { BoilerplateCardConfig } from './types';
import { actionHandler } from './action-handler-directive';

/* eslint no-console: 0 */
console.info(
  `%c  donder-room-panel \n%c  version: ${CARD_VERSION}  `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray',
);

(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'donder-room-panel',
  name: 'Donder Room Panel',
  description: 'A template custom card for you to create something awesome',
});

export class BoilerplateCard extends LitElement {
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    // REPLACE "donder-room-panel" with widget name, everywhere in the project
    // REPLACE the file name with the actual widget name
    return document.createElement('donder-room-panel-editor');
  }

  public static getStubConfig(): Record<string, unknown> {
    return {};
  }

  @property({ attribute: false }) public hass!: HomeAssistant;
  @state() private config!: BoilerplateCardConfig;

  public setConfig(config: BoilerplateCardConfig): void {
    // TODO Check for required fields and that they are of the proper format
    if (!config) {
      throw new Error('Invalid configuration');
    }

    if (config.test_gui) {
      getLovelace().setEditMode(true);
    }

    this.config = {
      ...config,
    };
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    if (!this.config) {
      return false;
    }

    return hasConfigOrEntityChanged(this, changedProps, false);
  }

  private _handleAction(ev: ActionHandlerEvent): void {
    if (this.hass && this.config && ev.detail.action) {
      handleAction(this, this.hass, this.config, ev.detail.action);
    }
  }

  private _showWarning(warning: string): TemplateResult {
    return html`
      <hui-warning>${warning}</hui-warning>
    `;
  }

  private _showError(error: string): TemplateResult {
    const errorCard = document.createElement('hui-error-card');
    errorCard.setConfig({
      type: 'error',
      error,
      origConfig: this.config,
    });

    return html`
      ${errorCard}
    `;
  }

  static get styles(): CSSResultGroup {
    return css`
      /* REPLACE "donder-room-panel" with actual widget name */
      .type-custom-donder-room-panel {
        height: 100%;
        width: 100%;
        background-color: transparent !important;
      }
      .donder-widget-wrapper {
        padding: 5%;
      }
      .donder-widget {
        display: inline-block;
        border-radius: 50%;
        min-width: 20px;
        min-height: 20px;
        background: var(--card-background-color);
        text-align: center;
        box-sizing: border-box;
        white-space: nowrap;
        width: 100%;
      }
      .donder-widget:before {
        content: "";
        display: inline-block;
        vertical-align: middle;
        padding-top: 100%;
        height: 0;
      }
      .donder-widget span {
        display: inline-block;
        vertical-align: middle;
      }
      .summary-temp-internal {
        font-size: 4rem;
        font-weight: lighter;
        line-height: normal;
      }
    `;
  }

  protected renderThermostat(climate, multi = false) {
    const stateObj = this.hass.states[climate.entity]
    const multiClass = multi ? 'multi' : ''

    const friendlyStateName = {
      'heat_cool': 'Heat/Cool',
      'heat': 'Heat',
      'cool': 'Cool',
      'auto': 'Auto',
      'off': 'Off',
    }

    const icon = {
      'heat_cool': 'mdi:thermostat',
      'heat': 'mdi:thermometer',
      'cool': 'mdi:snowflake',
      'auto': 'mdi:thermostat',
      'off': 'mdi:thermometer-off',
    }

    return html`
      <div class=${`donder-widget ${multiClass}`}>
        <!-- <div class='title'>${stateObj.attributes.friendly_name}</div> -->
        <span>
          <div class='summary-temp-internal'>
            <div class='summary-temp-number'>${stateObj.attributes.current_temperature}
            <span class='summary-temp-unit'>${stateObj.attributes.temperature_unit}</span>
          </div>
          <div class='summary-temp-external'>${stateObj.attributes.ext_current_temperature}${stateObj.attributes.temperature_unit}</div>
          <div class='summary-state'>
            <div class='summary-state'>${friendlyStateName[stateObj.state]}</div>
            <ha-icon icon=${icon[stateObj.state]}></ha-icon>
          </div>
        </span>
        <!-- <div class='summary-state'>
          <div class='summary-state'>${friendlyStateName[stateObj.state]}</div>
          <ha-icon icon='mdi:thermometer'></ha-icon>
        </div>
        <div class='summary-temp'>
          <div class='summary-temp-internal'>${stateObj.attributes.current_temperature}</div>
          <div class='summary-temp-external'>${stateObj.attributes.ext_current_temperature}</div>
        </div> -->
      </div>
    `
  }

  // protected renderScene() {

  // }

  protected render(): TemplateResult | void {
    // TODO Check for stateObj or other necessary things and render a warning if missing
    if (this.config.show_warning) {
      return this._showWarning('warning message');
    }

    if (this.config.show_error) {
      return this._showError('error message');
    }

    const env = this.hass.states['donder_env.global'].attributes
    // const scenes = this.hass.states['donder_scenes.global']?.attributes
    const { rooms } = env
    const roomId = this.config.room_id
    const room = rooms.filter((room: any) => room.id === roomId)[0]

    return html`
      <ha-card
        .header=${this.config.name}
        @action=${this._handleAction}
        .actionHandler=${actionHandler({
          hasHold: hasAction(this.config.hold_action),
          hasDoubleClick: hasAction(this.config.double_tap_action),
        })}
        tabindex="0"
      >
        <div class='donder-widget-wrapper'>
          ${room.climate.map((climate: any) => {
            return this.renderThermostat(climate, room.climate.map.length > 1)
          })}
        </div>
      </ha-card>
    `;
  }
}

customElements.define("donder-room-panel", BoilerplateCard);
