import type { Page } from "@playwright/test";

/**
 * In-page timing helpers.
 *
 * Timing is measured inside the browser rather than across the automation
 * boundary, so what is reported is the interaction itself — from the event to
 * the frame that shows its result — and not the test runner's polling interval.
 *
 * "Painted" means two animation frames after the event: React 19 commits in the
 * first, the compositor shows it in the second.
 */
export interface Sample {
  label: string;
  samples: number[];
  median: number;
  max: number;
  note?: string;
}

declare global {
  interface Window {
    __qa: {
      clickAndPaint(selector: string, index?: number): Promise<number>;
      setValueAndPaint(selector: string, value: string): Promise<number>;
      typeAndAwaitRows(
        selector: string,
        value: string,
        watchSelector: string,
      ): Promise<number>;
      clickAndAwaitSelector(
        selector: string,
        appears: string,
        index?: number,
      ): Promise<number>;
      hoverAndAwaitTooltip(surfaceSelector: string): Promise<number>;
    };
  }
}

export async function installTimingHelpers(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const painted = () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });

    const pick = (selector: string, index = 0): HTMLElement => {
      const found = document.querySelectorAll<HTMLElement>(selector);
      const element = found[index];
      if (!element) throw new Error(`No element for ${selector}[${index}]`);
      return element;
    };

    /** React reads the value off the DOM node, so set it through the native
        setter before dispatching, or the change is invisible to it. */
    const setNativeValue = (element: HTMLElement, value: string) => {
      const prototype =
        element instanceof HTMLSelectElement
          ? HTMLSelectElement.prototype
          : HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
      setter?.call(element, value);
    };

    window.__qa = {
      async clickAndPaint(selector, index = 0) {
        const element = pick(selector, index);
        const start = performance.now();
        element.click();
        await painted();
        return performance.now() - start;
      },

      async setValueAndPaint(selector, value) {
        const element = pick(selector);
        const start = performance.now();
        setNativeValue(element, value);
        element.dispatchEvent(new Event("change", { bubbles: true }));
        await painted();
        return performance.now() - start;
      },

      async typeAndAwaitRows(selector, value, watchSelector) {
        const input = pick(selector);
        const watched = document.querySelector(watchSelector);
        if (!watched) throw new Error(`Nothing to watch at ${watchSelector}`);
        const start = performance.now();
        const changed = new Promise<void>((resolve) => {
          const observer = new MutationObserver(() => {
            observer.disconnect();
            requestAnimationFrame(() =>
              requestAnimationFrame(() => resolve()),
            );
          });
          observer.observe(watched, {
            childList: true,
            subtree: true,
            characterData: true,
          });
        });
        setNativeValue(input, value);
        input.dispatchEvent(new Event("input", { bubbles: true }));
        await changed;
        return performance.now() - start;
      },

      async clickAndAwaitSelector(selector, appears, index = 0) {
        const element = pick(selector, index);
        const start = performance.now();
        const seen = new Promise<void>((resolve) => {
          const tick = () => {
            if (document.querySelector(appears)) {
              requestAnimationFrame(() => resolve());
              return;
            }
            requestAnimationFrame(tick);
          };
          tick();
        });
        element.click();
        await seen;
        return performance.now() - start;
      },

      async hoverAndAwaitTooltip(surfaceSelector) {
        const surface = pick(surfaceSelector);
        const box = surface.getBoundingClientRect();
        const x = box.left + box.width * 0.55;
        const y = box.top + box.height * 0.5;
        const start = performance.now();
        const seen = new Promise<void>((resolve, reject) => {
          const deadline = performance.now() + 2000;
          const tick = () => {
            const tooltip = document.querySelector(
              ".recharts-tooltip-wrapper",
            ) as HTMLElement | null;
            if (tooltip && tooltip.getBoundingClientRect().height > 0) {
              requestAnimationFrame(() => resolve());
              return;
            }
            if (performance.now() > deadline) {
              reject(new Error("Tooltip never appeared"));
              return;
            }
            requestAnimationFrame(tick);
          };
          tick();
        });
        for (const type of ["pointerover", "pointermove", "mouseover", "mousemove"]) {
          surface.dispatchEvent(
            new MouseEvent(type, {
              bubbles: true,
              clientX: x,
              clientY: y,
            }),
          );
        }
        await seen;
        return performance.now() - start;
      },
    };
  });
}

export function summarise(label: string, samples: number[], note?: string): Sample {
  const sorted = [...samples].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 === 0
      ? (sorted[middle - 1] + sorted[middle]) / 2
      : sorted[middle];
  return {
    label,
    samples: samples.map((value) => Math.round(value * 100) / 100),
    median: Math.round(median * 100) / 100,
    max: Math.round(Math.max(...samples) * 100) / 100,
    note,
  };
}
