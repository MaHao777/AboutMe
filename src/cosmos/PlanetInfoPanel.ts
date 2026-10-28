import type { ContentEntry, PlanetData } from './universeData';

interface ContentCard {
  element: HTMLElement;
  title: HTMLHeadingElement;
  description: HTMLParagraphElement;
  content: HTMLElement;
  entry: ContentEntry;
  entryIndex: number;
  slot: number;
  cycle: number;
}

/** A cyclic content rail whose position is driven by the orbit, without timed page changes. */
export class PlanetInfoPanel {
  private previousFocus: HTMLElement | null = null;
  private closeButton: HTMLButtonElement;
  private scroller: HTMLElement;
  private planet: PlanetData | null = null;
  private cards: ContentCard[] = [];
  private order: readonly number[] = [];
  private activeCard: ContentCard | null = null;
  private lastPosition = NaN;
  private lastSelected = -2;
  private reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  private motionChange = () => this.resize();

  constructor(
    private panel: HTMLElement,
    private onClose: () => void,
    private onSatellite: (planet: PlanetData, id: string) => void,
  ) {
    this.closeButton = panel.querySelector<HTMLButtonElement>('[data-close-panel]')!;
    this.scroller = panel.querySelector<HTMLElement>('.panel-scroll')!;
    panel.hidden = true;
    this.closeButton.addEventListener('click', onClose);
    this.reducedMotion.addEventListener('change', this.motionChange);
  }

  open(planet: PlanetData, order: readonly number[]) {
    const opening = this.panel.hidden;
    if (opening) this.previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    this.panel.style.setProperty('--planet-color', planet.color);
    if (this.planet?.id !== planet.id) {
      this.planet = planet;
      this.order = order.length ? order : [0];
      const entries: ContentEntry[] = planet.satellites.length ? planet.satellites : [planet];
      this.scroller.replaceChildren(); this.cards = []; this.activeCard = null;
      for (const cycle of entries.length > 1 ? [-1, 0, 1] : [0]) {
        this.order.forEach((entryIndex, slot) => {
          const card = this.createCard(entries[entryIndex], entryIndex, slot + cycle * entries.length, cycle);
          this.cards.push(card); this.scroller.append(card.element);
        });
      }
      const navigation = this.panel.querySelector<HTMLElement>('[data-panel-satellites]')!;
      navigation.replaceChildren();
      for (const satellite of planet.satellites) {
        const button = document.createElement('button');
        button.type = 'button'; button.className = 'satellite-entry';
        button.textContent = satellite.title; button.dataset.satellite = satellite.id;
        button.setAttribute('aria-label', `转动至${satellite.title}`);
        button.addEventListener('click', () => this.onSatellite(planet, satellite.id));
        navigation.append(button);
      }
    }
    this.lastPosition = NaN; this.lastSelected = -2;
    this.panel.hidden = false;
    if (opening) this.closeButton.focus({ preventScroll: true });
  }

  scrub(position: number, selectedIndex: number) {
    if (!this.planet || (position === this.lastPosition && selectedIndex === this.lastSelected)) return;
    this.lastPosition = position; this.lastSelected = selectedIndex;
    const count = this.order.length;
    const local = count > 1 ? ((position % count) + count) % count : 0;
    const selected = Math.max(0, selectedIndex);
    const selectedSlot = this.order.indexOf(selected);
    const selectedCycle = count > 1 ? Math.round((local - selectedSlot) / count) : 0;
    const current = this.cards.find((card) => card.entryIndex === selected && card.cycle === selectedCycle)!;
    const stride = this.scroller.clientHeight * .7;
    for (const card of this.cards) {
      const offset = card.slot - local;
      const isCurrent = card === current;
      card.element.hidden = this.reducedMotion.matches ? !isCurrent : Math.abs(offset) > 1.65;
      card.element.style.transform = `translate3d(0,${this.reducedMotion.matches ? 0 : offset * stride}px,0)`;
      card.element.style.opacity = String(this.reducedMotion.matches ? 1 : Math.max(0, 1 - Math.abs(offset) * .42));
    }
    if (this.activeCard !== current) {
      if (this.activeCard) this.activate(this.activeCard, false);
      this.activeCard = current; this.activate(current, true);
      this.panel.dataset.entry = current.entry.id;
      this.panel.querySelector('[data-panel-eyebrow]')!.textContent = this.planet.satellites.length
        ? `${this.planet.title} · ${selected + 1} / ${count}` : `${this.planet.index} / ${this.planet.subtitle}`;
      this.panel.querySelectorAll<HTMLButtonElement>('[data-satellite]').forEach((button) => {
        button.setAttribute('aria-pressed', String(button.dataset.satellite === current.entry.id));
      });
    }
    this.panel.dataset.scrubPosition = position.toFixed(6);
  }

  private createCard(entry: ContentEntry, entryIndex: number, slot: number, cycle: number): ContentCard {
    const element = document.createElement('article'); element.className = 'panel-entry';
    element.inert = true; element.setAttribute('aria-hidden', 'true');
    const title = document.createElement('h2'); title.textContent = entry.title;
    const description = document.createElement('p'); description.className = 'panel-description'; description.textContent = entry.description;
    const content = document.createElement('div'); content.className = 'panel-content';
    for (const text of entry.body) { const paragraph = document.createElement('p'); paragraph.textContent = text; content.append(paragraph); }
    if (entry.href) {
      const link = document.createElement('a'); link.href = entry.href;
      link.className = 'content-link'; link.textContent = `${entry.linkLabel ?? '继续阅读'} ↗`; content.append(link);
    }
    element.append(title, description, content);
    return { element, title, description, content, entry, entryIndex, slot, cycle };
  }

  private activate(card: ContentCard, active: boolean) {
    card.element.inert = !active; card.element.setAttribute('aria-hidden', String(!active));
    for (const [element, attribute] of [[card.element, 'data-panel-entry'], [card.title, 'data-panel-title'], [card.description, 'data-panel-description'], [card.content, 'data-panel-content']] as const) {
      if (active) element.setAttribute(attribute, ''); else element.removeAttribute(attribute);
    }
    if (active) card.title.id = 'planet-panel-title'; else card.title.removeAttribute('id');
  }

  resize() { this.lastPosition = NaN; }

  hide() {
    this.panel.hidden = true;
    this.previousFocus?.focus({ preventScroll: true }); this.previousFocus = null;
  }

  dispose() {
    this.closeButton.removeEventListener('click', this.onClose);
    this.reducedMotion.removeEventListener('change', this.motionChange);
  }
}
