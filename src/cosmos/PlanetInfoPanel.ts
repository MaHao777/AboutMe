import type { ContentEntry, PlanetData } from './universeData';

export class PlanetInfoPanel {
  private previousFocus: HTMLElement | null = null;
  private closeButton: HTMLButtonElement;
  private planetId = '';
  private motions: Animation[] = [];
  private ghost: HTMLElement | null = null;
  private motionEpoch = 0;
  private reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  private entryElement: HTMLElement;

  constructor(
    private panel: HTMLElement,
    private onClose: () => void,
    private onSatellite: (planet: PlanetData, id: string) => void,
  ) {
    this.closeButton = panel.querySelector<HTMLButtonElement>('[data-close-panel]')!;
    this.entryElement = panel.querySelector<HTMLElement>('[data-panel-entry]')!;
    this.closeButton.addEventListener('click', onClose);
  }

  show(planet: PlanetData, entry: ContentEntry, isSatellite: boolean, direction: 1 | -1 = 1) {
    const opening = this.panel.hidden;
    const scroller = this.panel.querySelector<HTMLElement>('.panel-scroll')!;
    const animate = !opening && this.planetId === planet.id && this.panel.dataset.entry !== entry.id && !this.reducedMotion.matches;
    const oldContent = animate ? this.entryElement.cloneNode(true) as HTMLElement : null;
    const oldTransform = animate ? getComputedStyle(this.entryElement).transform : 'none';
    const oldHeight = this.entryElement.offsetHeight;
    const oldScroll = scroller.scrollTop;
    this.cancelMotion();
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
      heading.textContent = '卫星项目'; heading.className = 'sr-only'; satellites.append(heading);
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
    scroller.scrollTop = 0;
    if (oldContent) this.animateEntry(oldContent, oldTransform, oldHeight, oldScroll, direction);
    if (opening) this.closeButton.focus({ preventScroll: true });
  }

  private animateEntry(oldContent: HTMLElement, transform: string, height: number, scroll: number, direction: 1 | -1) {
    const scroller = this.entryElement.parentElement!;
    oldContent.classList.add('panel-entry-ghost');
    oldContent.inert = true;
    oldContent.setAttribute('aria-hidden', 'true');
    for (const node of [oldContent, ...oldContent.querySelectorAll<HTMLElement>('*')]) {
      for (const attribute of [...node.attributes]) {
        if (attribute.name === 'id' || attribute.name.startsWith('data-panel-')) node.removeAttribute(attribute.name);
      }
    }
    oldContent.style.height = `${height}px`;
    oldContent.style.top = `${-scroll}px`;
    scroller.append(oldContent); this.ghost = oldContent;
    const distance = scroller.clientHeight;
    const timing: KeyframeAnimationOptions = { duration: 620, easing: 'cubic-bezier(.22,.75,.25,1)', fill: 'both' };
    const outgoing = oldContent.animate([
      { transform: transform === 'none' ? 'translateY(0)' : transform, opacity: 1 },
      { transform: `translateY(${-direction * distance}px)`, opacity: 0 },
    ], timing);
    const incoming = this.entryElement.animate([
      { transform: `translateY(${direction * distance}px)`, opacity: 0 },
      { transform: 'translateY(0)', opacity: 1 },
    ], timing);
    this.motions = [outgoing, incoming];
    this.panel.dataset.motion = direction === 1 ? 'forward' : 'backward';
    const epoch = this.motionEpoch;
    incoming.onfinish = () => { if (epoch === this.motionEpoch) this.cancelMotion(); };
  }

  private cancelMotion() {
    this.motionEpoch++;
    this.motions.forEach((motion) => { motion.onfinish = null; motion.cancel(); });
    this.motions = [];
    this.ghost?.remove(); this.ghost = null;
    this.panel.dataset.motion = 'idle';
  }

  hide() {
    this.cancelMotion();
    this.panel.hidden = true;
    this.previousFocus?.focus({ preventScroll: true });
    this.previousFocus = null;
  }

  dispose() { this.cancelMotion(); this.closeButton.removeEventListener('click', this.onClose); }
}
