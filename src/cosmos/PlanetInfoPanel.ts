import type { ContentEntry, PlanetData } from './universeData';

export class PlanetInfoPanel {
  private previousFocus: HTMLElement | null = null;
  private closeButton: HTMLButtonElement;
  private planetId = '';

  constructor(
    private panel: HTMLElement,
    private onClose: () => void,
    private onSatellite: (planet: PlanetData, id: string) => void,
  ) {
    this.closeButton = panel.querySelector<HTMLButtonElement>('[data-close-panel]')!;
    this.closeButton.addEventListener('click', onClose);
  }

  show(planet: PlanetData, entry: ContentEntry, isSatellite: boolean) {
    const opening = this.panel.hidden;
    if (opening) this.previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    this.panel.style.setProperty('--planet-color', planet.color);
    const index = planet.satellites.findIndex((satellite) => satellite.id === entry.id);
    this.panel.querySelector('[data-panel-eyebrow]')!.textContent = isSatellite ? `${planet.title} · ${index + 1} / ${planet.satellites.length}` : `${planet.index} / ${planet.subtitle}`;
    this.panel.dataset.entry = entry.id;
    this.panel.querySelector('[data-panel-title]')!.textContent = entry.title;
    this.panel.querySelector('[data-panel-description]')!.textContent = entry.description;
    const content = this.panel.querySelector<HTMLElement>('[data-panel-content]')!;
    const paragraphs = entry.body.map((text) => {
      const p = document.createElement('p'); p.textContent = text; return p;
    });
    content.replaceChildren(...paragraphs);
    if (entry.href) {
      const link = document.createElement('a');
      link.href = entry.href; link.textContent = `${entry.linkLabel ?? '继续阅读'} ↗`;
      link.className = 'content-link'; content.append(link);
    }
    const satellites = this.panel.querySelector<HTMLElement>('[data-panel-satellites]')!;
    if (this.planetId !== planet.id) {
      this.planetId = planet.id;
      satellites.replaceChildren();
      const heading = document.createElement('h3');
      heading.textContent = '卫星项目'; satellites.append(heading);
      for (const satellite of planet.satellites) {
        const button = document.createElement('button');
        button.type = 'button'; button.className = 'satellite-entry';
        button.textContent = satellite.title; button.dataset.satellite = satellite.id;
        button.setAttribute('aria-label', `转动至${satellite.title}`);
        button.addEventListener('click', () => this.onSatellite(planet, satellite.id));
        satellites.append(button);
      }
    }
    satellites.querySelectorAll<HTMLButtonElement>('[data-satellite]').forEach((button) => {
      button.setAttribute('aria-pressed', String(entry.id === button.dataset.satellite));
    });
    this.panel.hidden = false;
    const scroller = this.panel.querySelector<HTMLElement>('.panel-scroll')!;
    scroller.scrollTop = 0;
    if (opening) this.closeButton.focus({ preventScroll: true });
  }

  hide() {
    this.panel.hidden = true;
    this.previousFocus?.focus({ preventScroll: true });
    this.previousFocus = null;
  }

  dispose() { this.closeButton.removeEventListener('click', this.onClose); }
}
