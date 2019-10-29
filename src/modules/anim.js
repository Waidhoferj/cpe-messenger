/**
 * Visually transitions object from current state to the provided end state.
 * @param {HTMLElement} el the element on which the animation will be performed
 * @param {number} duration the length of the animation in seconds
 * @param {object} changes the end values of css attributes
 */
export function transition(el, duration, changes) {
  return new Promise(resolve => {
    el.addEventListener("transitionend", e => resolve(), { once: true });
    let transitionString = Object.keys(changes)
      .map(prop => `${prop} ${duration}s`)
      .join(",");
    el.style.transition = transitionString;
    let nothingChanged = true;
    for (let prop in changes) {
      if (el.style[prop] === changes[prop]) continue;
      el.style[prop] = changes[prop];
      nothingChanged = false;
    }
    if (nothingChanged) resolve();
  });
}

/**
 * Wraps the css animation in a promise so that it can be sequenced in js
 * @param {HTMLElement} el element to be animated
 * @param {string} animClass the CSS string title of the animation class to be applied
 */
export function animateEl(el, animClass) {
  return new Promise(resolve => {
    el.addEventListener(
      "animationend",
      () => {
        el.classList.remove(animClass);
        resolve();
      },
      { once: true }
    );
    el.classList.add(animClass);
  });
}

/**
 * delays code execution asynchronously
 * @param {number} ms number of miliseconds to delay
 */
export function delay(ms) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}
