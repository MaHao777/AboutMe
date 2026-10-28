import type { ContentEntry, PlanetData } from './universeData';

export class PlanetInfoPanel {
  private previousFocus: HTMLElement | null = null;
  private closeButton: HTMLButtonElement;

  constructor(
    private panel: HTMLElement,
    private onClose: () => void,
    private onSatellite: (planet: PlanetData, id: string) => void,
  ) {
    this.closeButton = panel.querySelector<HTMLButtonElement>('[data-close-panel]')!;
    this.closeButton.addEventListener('click', onClose);
  }

  show(planet: PlanetData, entry: ContentEntry, isSatellite: boolean) {
    if (this.panel.hidden) this.previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    this.panel.style.setProperty('--planet-color', planet.color);
    this.panel.querySelector('[data-panel-eyebrow]')!.textContent = isSatellite ? `${planet.index} / ${planet.title} · 卫星` : `${planet.index} / ${planet.subtitle}`;
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
    satellites.replaceChildren();
    const heading = document.createElement('h3');
    heading.textContent = isSatellite ? '继续探索这个星系' : `${planet.satellites.length} 颗项目卫星`;
    satellites.append(heading);
    for (const satellite of planet.satellites) {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'satellite-entry';
      button.textContent = `${satellite.title} ↗`;
      button.setAttribute('aria-pressed', String(entry.id === satellite.id));
      button.addEventListener('click', () => this.onSatellite(planet, satellite.id));
      const description = document.createElement('span'); description.textContent = satellite.description;
      button.append(description); satellites.append(button);
    }
    this.panel.hidden = false;
    const scroller = this.panel.querySelector<HTMLElement>('.panel-scroll')!;
    scroller.scrollTop = 0;
    this.closeButton.focus({ preventScroll: true });
  }

  hide() {
    this.panel.hidden = true;
    this.previousFocus?.focus({ preventScroll: true });
    this.previousFocus = null;
  }

  dispose() { this.closeButton.removeEventListener('click', this.onClose); }
}
