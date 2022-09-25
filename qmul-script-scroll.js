"use strict";

document.addEventListener(
  'DOMContentLoaded',
  () => {
    const UPDATE_RATE = 50;

    const entryFinder = (function() {
      let screenHeight = window.innerHeight;

      window.addEventListener("resize", ()=>{
        screenHeight = window.innerHeight;
      })

      function findCurrentHeader() {
        let lastHeader = null;

        document.querySelectorAll(`h1,h2,h3`).forEach(header => {
          const headerPos = header.getBoundingClientRect().y;

          if (headerPos > screenHeight * 0.4) {
            return lastHeader;
          }

          lastHeader = header;
        });

        return lastHeader;
      }

      function findTocEntry(header) {
        return document.getElementById(`toc-${header.id}`);
      }

      function findCurrentTocEntry() {
        const header = findCurrentHeader();
        if (header === null) return null;

        const toc = findTocEntry(header);
        if (toc === null) {
          throw `Unable to find TOC entry for header ID: ${header.id}`
        }

        return toc;
      }

      return {findCurrentTocEntry: findCurrentTocEntry};
    })();


    const toc = (function() {
      let currentEntry = null;
      const root = document.getElementById(`TOC`);

      function scrollToEntry(entry) {
        if (entry === null) {
          // scroll to top
          root.scrollTop = 0;
          return;
        }

        const entryRect = entry.getBoundingClientRect();
        const tocRect = root.getBoundingClientRect();

        // Y midpoint of the entry
        const entryY = root.scrollTop + entryRect.top + entryRect.height / 2;

        const scrollY = entryY - tocRect.height / 2;

        root.scrollTop = scrollY;
      }

      function highlightEntry(entry) {
        if (entry === null) {
          // do nothing
        } else {
          // highlight it
          entry.style.background = `rgba(63, 96, 178, 0.08)`;
          entry.style.fontWeight = 'bold';
        }
      }

      function unhighlightEntry(entry) {
        if (entry === null) {
          // do nothing
        } else {
          // highlight it
          entry.style.background = null;
          entry.style.fontWeight = null;
        }
      }

      // let i = 0
      function update() {
        // console.log(++i, "update")

        const entry = entryFinder.findCurrentTocEntry();
        if (currentEntry === entry) return;

        unhighlightEntry(currentEntry);
        highlightEntry(entry);
        scrollToEntry(entry);

        currentEntry = entry;
      }

      return {update: update};
    })();

    let canUpdate = true;
    let wantedToUpdateButBlocked = false;

    function rateLimitedUpdate() {
      if (!canUpdate) {
        wantedToUpdateButBlocked = true;
        return;
      };

      toc.update()

      canUpdate = false;
      setTimeout(() => {
        canUpdate = true;

        if (wantedToUpdateButBlocked) {
          wantedToUpdateButBlocked = false;
          rateLimitedUpdate();
        }
      }, UPDATE_RATE);
    }

    document.addEventListener("scroll", rateLimitedUpdate)
    window.addEventListener("resize", rateLimitedUpdate)
  },
  false,
);
