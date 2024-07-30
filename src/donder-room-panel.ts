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
    return this.hasConfigOrEntityChanged(this, changedProps, true);
  }

  protected hasConfigOrEntityChanged(element: any, changedProps: PropertyValues, forceUpdate: boolean): boolean {

    if (changedProps.has('config') || forceUpdate) {
      return true;
    }

    if (element.config!.room_id) {
      const oldHass = changedProps.get('hass') as HomeAssistant | undefined;
      if (oldHass) {
        let hasChanged = false
        
        const env = this.hass.states['donder_env.global'].attributes
        const { rooms } = env
        const roomId = this.config.room_id
        const room = rooms.filter((room: any) => room.id === roomId)[0]

        for (let i=0; i<=room.climate.length-1; i++) {
          const climateEntity = room.climate[i].entity
          const internalEntity = room.climate[i].internal_temp
          if (climateEntity && oldHass.states[climateEntity] !== element.hass!.states[climateEntity]) {
            hasChanged = true
            break
          }
          if (internalEntity && oldHass.states[internalEntity] !== element.hass!.states[internalEntity]) {
            hasChanged = true
            break
          }
        }

        if (oldHass.states['sensor.openweathermap_forecast_temperature'] !== element.hass!.states['sensor.openweathermap_forecast_temperature']) {
          hasChanged = true
        }
        
        return hasChanged
      }
      return true;
    } else {
      return false;
    }
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
      .room-title {
        font-size: 1.5rem;
        font-weight: 400;
        margin-bottom: 10px;
        margin-top: 20px;
        text-transform: uppercase;
        text-align: center;
      }
      .room-temp-wrapper {

      }
      .room-temp {
        display: flex;
        margin-bottom: 30px;
        align-items: flex-start;
        margin-top: 30px;
        justify-content: center;
      }
      .room-temp-number {
        font-size: 6.5rem;
        line-height: 6.5rem;
      }
      .room-temp-unit {
        font-size: 1.5rem;
        position: relative;
        top: 10px;
      }
      ha-card.ha-badge {
        background-color: var(--card-background-color) !important;
        box-sizing: border-box;
        padding: var(--spacing);
        display: flex;
        height: auto;
        margin: 5px 0;
      }
      ha-card.ha-badge ha-icon {
        border-radius: 50%;
        background-color: var(--card-background-color);
        width: 42px;
        min-width: 42px;
        height: 42px;
        display: flex;
        text-align: center;
        align-content: center;
        align-items: center;
        justify-content: center;
      }
      ha-card.ha-badge .ha-badge-content {
        margin-left: 16px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        align-content: center;
      }
      ha-card.ha-badge .ha-badge-content .ha-badge-title {
        font-size: .8rem;
        font-weight: 400;
        opacity: 0.7;
        text-transform: uppercase;
      }
      ha-card.ha-badge .ha-badge-content .ha-badge-status {
        font-size: 1rem;
        font-weight: 500;
        line-height: normal;
      }
      .donder-widget-wrapper {
        /* padding: 5%; */
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
      ha-card.ha-badge.heat_cool ha-icon {
        background: var(--mode-heat-cool-color);
        color: var(--card-background-color);
      }
      ha-card.ha-badge.heat ha-icon {
        background: var(--mode-heat-color);
        color: var(--card-background-color);
      }
      ha-card.ha-badge.cool ha-icon {
        background: var(--mode-cool-color);
        color: var(--card-background-color);
      }
      ha-card.ha-badge.auto ha-icon {
        background: var(--mode-auto-color);
        color: var(--card-background-color);
      }
      ha-card.ha-badge.dry ha-icon {
        background: var(--mode-dry-color);
        color: var(--card-background-color);
      }
      ha-card.ha-badge.off ha-icon {
        background: var(--mode-off-color);
      }
    `;
  }

  private toggleMoreInfo(ev: Event, entity): void {
    ev.stopPropagation();
    this.hass.callService('browser_mod', 'more_info', {
      entity: entity,
    })
  }

  protected renderThermostat(climate: any) {
    const hasAC = climate?.entity
    const renderThermostat = hasAC || climate?.internal_temp
    const stateIcons = {
      'heat_cool': 'mdi:sun-snowflake-variant',
      'heat': 'mdi:fire',
      'cool': 'mdi:snowflake',
      'auto': 'mdi:autorenew',
      'dry': 'mdi:water-percent',
      'off': 'mdi:power',
    }
    const friendlyNames = {
      'heat_cool': 'Heat/Cool',
      'heat': 'Heat',
      'cool': 'Cool',
      'auto': 'Auto',
      'dry': 'Dry',
      'off': 'Off',
    }

    if (renderThermostat) {
      let widgetDom 

      if (hasAC) {
        const climateEntity = this.hass.states[climate.entity]
        const modeClass = climateEntity.state

        widgetDom = html`
          <div class="room-temp" @click=${(ev) => this.toggleMoreInfo(ev, climate.entity)}>
            <span class='room-temp-number'>${climateEntity.attributes.current_temperature}</span>
            <span class='room-temp-unit'>${climateEntity.attributes.temperature_unit}</span>
          </div>

          <ha-card
            @action=${(event) => this.toggleMoreInfo(event, climate.entity)}
            .actionHandler=${actionHandler({
              hasHold: hasAction(this.config.hold_action),
              hasDoubleClick: hasAction(this.config.double_tap_action),
            })}
            @click=${(ev) => this.toggleMoreInfo(ev, climate.entity)}
            class=${`ha-badge ${modeClass}`}
          >
            <ha-icon icon=${stateIcons[climateEntity.state]}></ha-icon>
            <div class="ha-badge-content">
              <div class="ha-badge-title">Thermostat</div>
              <div class=${`ha-badge-status ${modeClass}`}>${friendlyNames[climateEntity.state]}</span>
            </div>
          </ha-card>
        `
      } else {
        const climateEntity = this.hass.states[climate.internal_temp]
        widgetDom = html`
          <span class='room-temp-number'>${climateEntity.state}</span>
        `
      }      

      return html`
        <div class="room-temp-wrapper">
          ${widgetDom}
        </div>
      `
    } else {
      return null
    }    
  }

  protected renderExternaTemp() {
    const status = this.hass.states['sensor.openweathermap_forecast_temperature'].state+' '+this.hass.states['sensor.openweathermap_forecast_temperature'].attributes.unit_of_measurement

    // if (climate?.entity) {
    //   const climateEntity = this.hass.states[climate.entity]
    //   status = climateEntity.attributes.ext_current_temperature+' '+climateEntity.attributes.temperature_unit
    // } else {
    //   status = this.hass.states['sensor.openweathermap_forecast_temperature'].state+' '+this.hass.states['sensor.openweathermap_forecast_temperature'].attributes.unit_of_measurement
    // }
    return html`
      <ha-card
        @action=${this._handleAction}
        .actionHandler=${actionHandler({
          hasHold: hasAction(this.config.hold_action),
          hasDoubleClick: hasAction(this.config.double_tap_action),
        })}
        class='ha-badge'
      >
        <ha-icon icon="mdi:thermometer"></ha-icon>
        <div class="ha-badge-content">
          <div class="ha-badge-title">Outside</div>
          <div class="ha-badge-status">${status}</div>
        </div>
      </ha-card>
    `
  }

  protected renderPower(power: any) {
    if (!power) {
      return null;
    }
    
    const powerValue = this.hass.states[power?.entity]?.state
    const unit = this.hass.states[power?.entity]?.attributes.unit_of_measurement as string
    const consumption = {
      W: 0,
      kW: 0,
    }

    if (powerValue) {
      consumption[unit] += parseFloat(powerValue)
    }
    const totalConsumption = consumption.W + (consumption.kW / 1000)

    return html`
      <ha-card
        @action=${(event) => this.toggleMoreInfo(event, power.entity)}
        .actionHandler=${actionHandler({
          hasHold: hasAction(this.config.hold_action),
          hasDoubleClick: hasAction(this.config.double_tap_action),
        })}
        class='ha-badge'
      >
        <ha-icon icon="mdi:lightning-bolt"></ha-icon>
        <div class="ha-badge-content">
          <div class="ha-badge-title">Consumption</div>
          <div class="ha-badge-status">${totalConsumption >= 1000 ? `${(totalConsumption/1000).toFixed(1)} kW` : `${totalConsumption.toFixed(1)} W`}</div>
        </div>
      </ha-card>
    `
  }

  protected renderScenes(roomName: string) {
    const scenes = this.hass.states['donder_scenes.global']?.attributes
    const sceneKeys = Object.keys(scenes)
    const filteredSceneKeys = sceneKeys.filter((item) => scenes[item].group === roomName);

    console.log(roomName, filteredSceneKeys)

    return html`
      <div class="room-scenes">
        <div class="room-scenes-title">Scenes</div>
        <div class='summary-group-scenes'>
          ${filteredSceneKeys.map(scene => {
            return html`
              <div
                @action=${(e) => this._handleSceneAction(e, scene)}
                class="scene"
                .actionHandler=${actionHandler({
                  hasHold: hasAction(this.config.hold_action),
                })}
              >${scenes[scene].name}</div>
            `
          })}
          <div class="scene" @click=${() => this._toggleEditScene(null, roomName)}>
            <div class="add-scene-icon">
              <ha-icon icon='mdi:plus'></ha-icon>
            </div>
          </div>
        </div>
      </div>
    `
  }

  protected _handleSceneAction(ev: ActionHandlerEvent, scene): void {
    const { action } = ev?.detail

    if (action === 'hold') {
      this._toggleEditScene(scene)
    }

    if (action === 'tap') {
      this.hass.callService('donder_scenes', 'trigger', {scene: scene})
    }
  }

  protected _toggleEditScene(scene?: any, roomName?: string) {
    console.log("Editing / Adding", roomName, scene)
    const env = this.hass.states['donder_env.global'].attributes
    this.hass.callService('browser_mod', 'popup', {
      content: {
        type: 'custom:donder-scene-modal',
        isNested: false,
        isNew: !scene,
        sensors: env.sensors,
        devices: [
          ...env.shutters || [],
          ...env.switches || [],
        ],
        locked: false,
        sceneName: this.config.scene,
        scene: scene ? this.hass.states['donder_scenes.global'].attributes[scene] : null,
        roomName: roomName || null,
        closeModal: true,
      },
      size: "wide",
      browser_id: localStorage.getItem('browser_mod-browser-id'),
    })
  }

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
    const climate = room.climate
    const power = room.power

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
          <div class="room-title">${room.name}</div>
          ${this.renderThermostat(climate)} 
          ${this.renderExternaTemp()}
          ${this.renderPower(power)}         
          ${this.renderScenes(room.name)} 
        </div>
      </ha-card>
    `;
  }
}

customElements.define("donder-room-panel", BoilerplateCard);
