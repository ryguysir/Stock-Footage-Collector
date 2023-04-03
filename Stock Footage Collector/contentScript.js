(() => {
  // Listen for messages from the popup.
  chrome.runtime.onMessage.addListener((msg, sender, response) => {
    // First, validate the message's structure.
    if (msg.from === "popup" && msg.subject === "DOMInfo") {
      if (document.URL.includes("getty")) {
        console.log(document.URL);
        response(gettyVidSearch());
      }
      if (document.URL.includes("dissolve")) {
        console.log(document.URL);
        response(dissolveVidSearch());
      }
      if (document.URL.includes("shutter")) {
        console.log(document.URL);
        response(shutterStockVidSearch());
      }
      if (document.URL.includes("artgrid")) {
        console.log(document.URL);
        response(artgridVidSearch());
      }
      if (document.URL.includes("pond5")) {
        console.log(document.URL);
        response(pond5VidSearch());
      }
      if (document.URL.includes("stock.adobe")) {
        console.log(document.URL);
        response(adobeStockVidSearch());
      }
      if (document.URL.includes("motionarray")) {
        console.log(document.URL);
        response(motionArrayVidSearch());
      }
      if (document.URL.includes("stocksy")) {
        console.log(document.URL);
        response(stocksyVidSearch());
      }
      if (document.URL.includes("filmsupply")) {
        console.log(document.URL);
        response(filmSupplyVidSearch());
      }
      if (document.URL.includes("filmpac")) {
        console.log(document.URL);
        response(filmPacVidSearch());
      }
      if (document.URL.includes("istock")) {
        console.log(document.URL);
        response(iStockVidSearch());
      }
      if (document.URL.includes("nimia")) {
        console.log(document.URL);
        response(nimiaVidSearch());
      }
    }
  });

  //search getty for video
  const gettyVidSearch = () => {
    if (document.getElementsByTagName("video")[0].src !== undefined) {
      let videoId =
        document.URL.match(/\d+$/, "g")[0] !== undefined
          ? document.URL.match(/\d+$/, "g")[0]
          : "no video id present";

      return [
        videoId,
        document.getElementsByTagName("video")[0].src,
        "new",
        "Getty",
        document.URL,
      ];
    }
  };

  //search dissolve for video
  const dissolveVidSearch = () => {
    if (document.getElementsByTagName("source")[0].src !== undefined) {
      let videoId =
        document.getElementsByClassName("product_details__column")[0]
          .children[1].innerText !== undefined
          ? document.getElementsByClassName("product_details__column")[0]
              .children[1].innerText
          : "no video id present";

      return [
        videoId,
        document.getElementsByTagName("source")[0].src,
        "new",
        "Dissolve",
        document.URL,
      ];
    }
  };

  //search shutterstock for video
  const shutterStockVidSearch = () => {
    console.log(
      document.getElementsByTagName("video")[0].children[0].src,
      document.getElementsByClassName("mui-6rhc9h")[0].innerText
    );
    if (
      document.getElementsByTagName("video")[0].children[0].src !== undefined
    ) {
      let videoId =
        document.getElementsByClassName("mui-6rhc9h")[0].innerText !== undefined
          ? document
              .getElementsByClassName("mui-6rhc9h")[0]
              .innerText.match(/\d+/, "g")[0]
          : "no video id present";

      return [
        videoId,
        document.getElementsByTagName("video")[0].children[0].src,
        "new",
        "Shutterstock",
        document.URL,
      ];
    }
  };

  //search artgrid for video
  const artgridVidSearch = () => {
    if (
      document.getElementsByTagName("video")[0].children[0].src !== undefined
    ) {
      let videoId =
        document.URL.match(/\/{0}(\d+)\/{0}/, "g")[0] !== undefined
          ? document.URL.match(/\/{0}(\d+)\/{0}/, "g")[0]
          : "no video id present";

      return [
        videoId,
        document
          .getElementsByClassName("art-clip-video-container")[0]
          .style.backgroundImage.match(/(?<=\")(.*?)(?=\")/, "g")[0],
        "new",
        "Artgrid",
        document.URL,
      ];
    }
  };

  //search Pond5 for video
  const pond5VidSearch = () => {
    console.log(
      document.getElementsByTagName("video")[0].children[0].src,
      Array.from(document.querySelectorAll(`[data-qa]`)).filter((elem) => {
        if (elem.getAttribute(`data-qa`) == "itemDetail-itemId") {
          return elem;
        }
      })[0].innerText
    );
    if (
      document.getElementsByTagName("video")[0].children[0].src !== undefined
    ) {
      let videoId =
        Array.from(document.querySelectorAll(`[data-qa]`)).filter((elem) => {
          if (elem.getAttribute(`data-qa`) == "itemDetail-itemId") {
            return elem;
          }
        })[0].innerText !== undefined
          ? Array.from(document.querySelectorAll(`[data-qa]`)).filter(
              (elem) => {
                if (elem.getAttribute(`data-qa`) == "itemDetail-itemId") {
                  return elem;
                }
              }
            )[0].innerText
          : "no video id present";

      return [
        videoId,
        document.getElementsByTagName("video")[0].children[0].src,
        "new",
        "Pond5",
        document.URL,
      ];
    }
  };

  //search Adobe Stock for video
  const adobeStockVidSearch = () => {
    console.log(
      document.getElementsByTagName("video")[0].children[0].src,
      document.getElementsByClassName("js-detail-content-id")[0].innerText
    );
    if (
      document.getElementsByTagName("video")[0].children[0].src !== undefined
    ) {
      let videoId =
        document.getElementsByClassName("js-detail-content-id")[0].innerText !==
        undefined
          ? document.getElementsByClassName("js-detail-content-id")[0].innerText
          : "no video id present";

      return [
        videoId,
        document.getElementsByTagName("video")[0].children[0].src,
        "new",
        "Adobe Stock",
        document.URL,
      ];
    }
  };

  //search Motion Array for video
  const motionArrayVidSearch = () => {
    console.log(
      document.getElementsByTagName("video")[0].children[0].src,
      document.URL.match(/\d+/, "g")[0]
    );
    if (
      document.getElementsByTagName("video")[0].children[0].src !== undefined
    ) {
      let videoId =
        document.URL.match(/\d+/, "g")[0] !== undefined
          ? document.URL.match(/\d+/, "g")[0]
          : "no video id present";

      return [
        videoId,
        document.getElementsByTagName("video")[0].children[0].src,
        "new",
        "Motion Array",
        document.URL,
      ];
    }
  };

  //search Stocksy for video
  const stocksyVidSearch = () => {
    console.log(
      document.getElementsByTagName("video")[0].src,
      document.URL.match(/\/{0}\d+\/{0}/, "g")[0]
    );
    if (document.getElementsByTagName("video")[0].src !== undefined) {
      let videoId =
        document.URL.match(/\/{0}\d+\/{0}/, "g")[0] !== undefined
          ? document.URL.match(/\/{0}\d+\/{0}/, "g")[0]
          : "no video id present";

      return [
        videoId,
        document.getElementsByTagName("video")[0].src,
        "new",
        "Stocksy",
        document.URL,
      ];
    }
  };

  //search Film Supply for video
  const filmSupplyVidSearch = () => {
    console.log(
      document.getElementsByTagName("video")[0].children[0].src,
      document.getElementsByClassName("css-14bjou0")[0].innerText
    );
    if (
      document.getElementsByTagName("video")[0].children[0].src !== undefined
    ) {
      let videoId =
        document.getElementsByClassName("css-14bjou0")[0].innerText !==
        undefined
          ? document.getElementsByClassName("css-14bjou0")[0].innerText
          : "no video id present";

      return [
        videoId,
        document.getElementsByTagName("video")[0].children[0].src,
        "new",
        "Film Supply",
        document.URL,
      ];
    }
  };

  //search Filmpac for video
  const filmPacVidSearch = () => {
    console.log(
      document.getElementsByTagName("video")[0].children[0].src,
      document.URL.match(/(?<=clips\/).*?(?=\/)/, "g")
    );
    if (
      document.getElementsByTagName("video")[0].children[0].src !== undefined
    ) {
      let videoId =
        document.URL.match(/(?<=clips\/).*?(?=\/)/, "g") !== undefined
          ? document.URL.match(/(?<=clips\/).*?(?=\/)/, "g")
          : "no video id present";

      return [
        videoId,
        document.getElementsByTagName("video")[0].children[0].src,
        "new",
        "Film Pac",
        document.URL,
      ];
    }
  };

  //search iStock for video
  const iStockVidSearch = () => {
    console.log(
      document.getElementsByTagName("video")[0].src,
      document.getElementsByClassName("asset-id")[0].children[1].innerText
    );
    if (document.getElementsByTagName("video")[0].src !== undefined) {
      let videoId =
        document.getElementsByClassName("asset-id")[0].children[1].innerText !==
        undefined
          ? document.getElementsByClassName("asset-id")[0].children[1].innerText
          : "no video id present";

      return [
        videoId,
        document.getElementsByTagName("video")[0].src,
        "new",
        "iStock",
        document.URL,
      ];
    }
  };

  //search Nimia for video
  const nimiaVidSearch = () => {
    console.log(
      document.getElementsByTagName("video")[0].children[0].src,
      document.getElementsByClassName("pill")[0].innerText.match(/\d+/, "g")[0]
    );
    if (
      document.getElementsByTagName("video")[0].children[0].src !== undefined
    ) {
      let videoId =
        document
          .getElementsByClassName("pill")[0]
          .innerText.match(/\d+/, "g")[0] !== undefined
          ? document
              .getElementsByClassName("pill")[0]
              .innerText.match(/\d+/, "g")[0]
          : "no video id present";

      return [
        videoId,
        document.getElementsByTagName("video")[0].children[0].src,
        "new",
        "Nimia",
        document.URL,
      ];
    }
  };

  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //add button to vid
  //   const vidBtnAdd = () => {
  //     //get width of first video player
  //     let firstVid = document.getElementsByTagName("video")[0];
  //     let width = firstVid.offsetWidth;
  //     let height = firstVid.offsetHeight;

  //     //create container to fit button
  //     const btnContainer = document.createElement("div");
  //     btnContainer.style.cssText = `
  // display: flex;
  // position: absolute;
  // height: ${height}px;
  // width: ${width}px;
  // align-items: start;
  // justify-content: end;
  // background: transparent;
  // overflow: hidden;
  // pointer-events: none;
  // z-index: 200;
  // `;
  //     document
  //       .getElementsByTagName("video")[0]
  //       .parentElement.appendChild(btnContainer);

  //     //create button
  //     const btn = document.createElement("div");
  //     btn.style.cssText = `
  // display: flex;
  // width:60px;
  // height:60px;
  // pointer-events: all;
  // cursor: pointer;
  // z-index: 201;
  // `;
  //     btn.addEventListener("mousedown", () => {
  //       console.log("button click");
  //     });
  //     btnContainer.appendChild(btn);

  //     //add in image for button
  //     const img = document.createElement("img");
  //     img.src = chrome.runtime.getURL("./assets/bookmark.png");
  //     btn.appendChild(img);
  //   };
  //   if (document.getElementsByTagName("video")[0] !== undefined) {
  //     vidBtnAdd;
  //   }
})();
