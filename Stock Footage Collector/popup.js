const extensionID = chrome.i18n.getMessage("@@extension_id");
var localStorage = {};
var currentCollection = "";
var vidsToDeleteOrCopy = [];
let selectedVids = [];
let currentlySelecting = false;

window.addEventListener("DOMContentLoaded", async () => {
  /*IF currently in fullPage, change out css to fullPage.css then create options and storage vids,
  ELSE keep CSS the same and then create options*/

  //set chrome storage
  await chrome.storage.local.get().then(function (result) {
    localStorage = result;
    if (window.innerWidth >= 301) {
      document.querySelector(
        "link[href='popup.css']"
      ).href = `chrome-extension://${extensionID}/fullPage.css`;
      createCollectionsList();
      loadVidsFromStorage();
    } else {
      createCollectionsList();
    }
  });

  //find main video and place it
  chrome.tabs.query(
    {
      active: true,
      currentWindow: true,
    },
    (tabs) => {
      // ...and send a request for the DOM info...
      chrome.tabs
        .sendMessage(
          tabs[0].id,
          { from: "popup", subject: "DOMInfo" }
          // ...also specifying a callback to be called
          //    from the receiving end (content script).
        )
        .then(addVidsToPage);
    }
  );
});

document.getElementById("full-page-bttn").addEventListener("mousedown", () => {
  // chrome.tabs.create({ url: chrome.runtime.getURL("popup.html") });
  chrome.windows.getCurrent(function (win) {
    chrome.tabs.query({ windowId: win.id }, function (tabArray) {
      for (var i in tabArray) {
        if (
          tabArray[i].url ==
          "chrome-extension://" + extensionID + "/" + "popup.html"
        ) {
          chrome.tabs.update(tabArray[i].id, { active: true });
          return;
        }
      }
      chrome.tabs.create({ url: chrome.runtime.getURL("popup.html") });
    });
  });
});

document
  .getElementsByClassName("collections-select")[0]
  .addEventListener("change", async (e) => {
    currentCollection = e.target.value;
    if (window.innerWidth >= 301) {
      deleteAllVids();
      loadVidsFromStorage();
    }
    await chrome.storage.local
      .get()
      .then((result) => {
        for (let i = 0; i < Object.keys(result).length; i++) {
          if (Object.keys(result)[i] === currentCollection) {
            result[Object.keys(result)[i]].first = true;
          } else {
            result[Object.keys(result)[i]].first = false;
          }
        }
        return result;
      })
      .then((result) => {
        chrome.storage.local.set(result);
      });
  });

document
  .getElementsByClassName("filter-select")[0]
  .addEventListener("change", async (e) => {
    deleteAllVids();
    if (e.target.value == "All") {
      loadVidsFromStorage();
      return;
    }

    for (let i = 0; i < localStorage[currentCollection].vidIds.length; i++) {
      console.log(e.target.value);
      if (localStorage[currentCollection].vidSite[i] == e.target.value) {
        addVidsToPage([
          localStorage[currentCollection].vidIds[i],
          localStorage[currentCollection].vidSources[i],
          "storage",
          localStorage[currentCollection].vidSite[i],
          localStorage[currentCollection].vidURL[i],
        ]);
      }
    }
  });

document
  .getElementsByClassName("new-collection")[0]
  .addEventListener("mousedown", () => {
    createNewCollection();
  });

document
  .getElementsByClassName("upload-bttn")[0]
  .addEventListener("click", (event) => {
    function logFile(event) {
      let str = event.target.result;
      let json = JSON.parse(str);
      uploadNewCollection(json);
    }

    let file = document.getElementById("file");
    // Stop the form from reloading the page
    event.preventDefault();

    // If there's no file, do nothing
    if (!file.value.length) {
      alert("no file loaded");
      return;
    }

    // Create a new FileReader() object
    let reader = new FileReader();

    // Read the file
    reader.readAsText(file.files[0]);

    // Setup the callback event to run when the file is read
    reader.onload = logFile;
    location.reload();
  });

document
  .getElementsByClassName("collection-save-bttn")[0]
  .addEventListener("click", () => {
    var a = document.createElement("a");
    var file = new Blob([JSON.stringify(localStorage[currentCollection])], {
      type: "application/json",
    });
    a.href = URL.createObjectURL(file);
    a.download = `${currentCollection}_Collection_json.JSON`;
    a.click();
  });

document
  .getElementsByClassName("collection-text-copy-bttn")[0]
  .addEventListener("click", () => {
    function selectText(nodeId) {
      const node = document.getElementsByClassName(nodeId)[0];

      if (document.body.createTextRange) {
        const range = document.body.createTextRange();
        range.moveToElementText(node);
        range.select();
      } else if (window.getSelection) {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(node);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        console.warn("Could not select text in node: Unsupported browser.");
      }
    }

    let table = elementCreator("table", ["table"]);

    for (let i = 0; i < localStorage[currentCollection].vidIds.length; i++) {
      let newRow = elementCreator("tr", ["table-row"]);
      let vidId = elementCreator("th", ["table-column"]);
      vidId.innerText = `${localStorage[currentCollection].vidIds[i]}`;
      let vidSource = elementCreator("th", ["table-column"]);
      vidSource.innerText = `${localStorage[currentCollection].vidURL[i]}`;
      newRow.appendChild(vidId);
      newRow.appendChild(vidSource);
      table.appendChild(newRow);
    }

    //append to table at bottom
    document.getElementsByClassName("container")[0].appendChild(table);

    selectText("table");

    // Copy the text inside the text field
    navigator.clipboard
      .writeText(window.getSelection().toString())
      .then(() => alert("Current collection copied to clipboard"));
    document.getElementsByClassName("container")[0].removeChild(table);
  });

document
  .getElementsByClassName("close-window")[0]
  .addEventListener("click", (x) => {
    document.getElementsByClassName("copy-or-move")[0].style.display = "none";
  });

document
  .getElementsByClassName("custom-file-upload-container")[0]
  .addEventListener("change", (x) => {
    x.target.parentNode.classList.add("custom-file-upload-activated");
  });

document
  .getElementsByClassName("collection-form")[0]
  .addEventListener("submit", (x) => {
    x.preventDefault();
    delete localStorage[currentCollection];
    if (Object.keys(localStorage).length >= 1) {
      localStorage[Object.keys(localStorage)[0]].first = "true";
      chrome.storage.local.clear();
      chrome.storage.local.set(localStorage);
      location.reload();
    } else {
      chrome.storage.local.clear();
      chrome.storage.local.set(localStorage);
      location.reload();
    }
  });

document
  .getElementsByClassName("copy-collection-form")[0]
  .addEventListener("submit", (e) => {
    e.preventDefault();
    if (e.submitter.innerText == "Copy to") {
      copyVidToCollection(e.target.children[0].value);
      document.getElementsByClassName("copy-or-move")[0].style.display = "none";
      return;
    }
  });

const dragStart = (e) => {
  if (currentlySelecting) {
    return;
  }
  let selectedElem = e.target;
  selectedElem.classList.add("entry-holder-selected");
};
const drag = (e) => {
  if (currentlySelecting) {
    return;
  }
  let selectedElem = e.target;
  let container = document.getElementsByClassName("vid-container")[0];
  let dropPoint = document.elementFromPoint(e.clientX, e.clientY);
  let dropPointWidth = dropPoint.getBoundingClientRect().width;
  let dropPointLeft = dropPoint.getBoundingClientRect().x;
  let dropPointIndex = [...container.children].indexOf(dropPoint);
  if (![...dropPoint.classList].includes("entry-holder")) {
    return;
  }

  // container.insertBefore(selectedElem, container.children[dropPointIndex]);
  if (e.clientX <= dropPointLeft + dropPointWidth / 2) {
    //if you're on the left side drop before
    container.insertBefore(selectedElem, container.children[dropPointIndex]);
  } else {
    //if you're on the right side drop after
    container.insertBefore(
      selectedElem,
      container.children[dropPointIndex + 1]
    );
  }
};
const dragEnd = async (e) => {
  if (currentlySelecting) {
    return;
  }
  console.log("drag end");
  console.log(document.getElementsByClassName("filter-select")[0].value);
  if (document.getElementsByClassName("filter-select")[0].value !== "All") {
    return;
  } else {
    let newVidSources = [];
    let newVidIds = [];
    let newVidURL = [];
    let newVidSite = [];

    let arrayOfEntries = [...document.getElementsByClassName("entry-holder")];

    for (let i = 0; i < arrayOfEntries.length; i++) {
      newVidSources.push(arrayOfEntries[i].children[0].src);
      newVidIds.push(arrayOfEntries[i].children[1].children[0].innerText);
      newVidURL.push(arrayOfEntries[i].children[1].children[0].href);
      newVidSite.push(
        arrayOfEntries[i].children[1].innerText.match(/.+?(?=\sID)/, "g")[0]
      );
    }
    localStorage[currentCollection].vidIds = newVidIds;
    localStorage[currentCollection].vidSite = newVidSite;
    localStorage[currentCollection].vidSources = newVidSources;
    localStorage[currentCollection].vidURL = newVidURL;

    await chrome.storage.local.set(localStorage);
  }

  e.target.classList.remove("entry-holder-selected");
};

const uploadNewCollection = async (data) => {
  if (
    document.getElementsByClassName("custom-file-upload-container")[0] !==
    undefined
  ) {
    document
      .getElementsByClassName("custom-file-upload-container")[0]
      .classList.remove("custom-file-upload-container-activated");
  }
  const newCollectionInput = document.getElementsByClassName(
    "new-collection-input"
  )[0].value;
  if (newCollectionInput == "") {
    alert("you need to have a name!");
    return;
  }
  if (Object.keys(localStorage).includes(newCollectionInput)) {
    alert("that collection already exists");
    return;
  }
  document.getElementsByClassName("new-collection-input")[0].value = "";

  let newLocalStorage = Object.assign(localStorage, {
    [newCollectionInput]: data,
  });
  await chrome.storage.local.set(newLocalStorage);
};

const createNewCollection = async () => {
  //get current input collection name, store it to a variable, then reset it
  const newCollectionInput = document.getElementsByClassName(
    "new-collection-input"
  )[0].value;
  if (newCollectionInput == "") {
    alert("you need to have a name!");
    return;
  }
  if (Object.keys(localStorage).includes(newCollectionInput)) {
    alert("that collection already exists");
    return;
  }
  document.getElementsByClassName("new-collection-input")[0].value = "";

  //add collection name to options pulldown
  let newOption = elementCreator("option", "collections-option");
  newOption.value = newCollectionInput;
  newOption.innerText = newCollectionInput;
  let selectContainer =
    document.getElementsByClassName("collections-select")[0];
  selectContainer.insertBefore(newOption, selectContainer.firstChild);

  await chrome.storage.local
    .get()
    .then((result) => {
      localStorage = result;
      //get current storage and add new collection, then set storage
      for (let i = 0; i < Object.keys(localStorage).length; i++) {
        localStorage[Object.keys(localStorage)[i]].first = false;
      }
      result[newCollectionInput] = {
        vidIds: [],
        vidSources: [],
        first: true,
        vidSite: [],
        vidURL: [],
      };
      return result;
    })
    .then((result) => {
      currentCollection = newCollectionInput;
      chrome.storage.local.set({ ...result, ...localStorage });
      while (
        document.getElementsByClassName("collections-select")[0].firstChild
      ) {
        document
          .getElementsByClassName("collections-select")[0]
          .removeChild(
            document.getElementsByClassName("collections-select")[0].firstChild
          );
      }
      createCollectionsList();
    });
};

const createCollectionsList = () => {
  for (let i = 0; i < Object.keys(localStorage).length; i++) {
    let newOption = elementCreator("option", "copy-collections-option");
    newOption.value = Object.keys(localStorage)[i];
    newOption.innerText = Object.keys(localStorage)[i];
    if (localStorage[Object.keys(localStorage)[i]].first) {
      currentCollection = Object.keys(localStorage)[i];
      document
        .getElementsByClassName("copy-collections-select")[0]
        .insertBefore(
          newOption,
          document.getElementsByClassName("copy-collections-select")[0]
            .firstChild
        );
    } else {
      document
        .getElementsByClassName("copy-collections-select")[0]
        .appendChild(newOption);
    }
  }
  //add local storage elemetns to pull down select
  for (let i = 0; i < Object.keys(localStorage).length; i++) {
    let newOption = elementCreator("option", "collections-option");
    newOption.value = Object.keys(localStorage)[i];
    newOption.innerText = Object.keys(localStorage)[i];
    if (localStorage[Object.keys(localStorage)[i]].first) {
      currentCollection = Object.keys(localStorage)[i];
      document
        .getElementsByClassName("collections-select")[0]
        .insertBefore(
          newOption,
          document.getElementsByClassName("collections-select")[0].firstChild
        );
    } else {
      document
        .getElementsByClassName("collections-select")[0]
        .appendChild(newOption);
    }
  }
  document.getElementsByClassName("collections-select")[0].value =
    currentCollection;
};

const loadVidsFromStorage = () => {
  //add currently loaded vids
  for (let i = 0; i < localStorage[currentCollection].vidIds.length; i++) {
    addVidsToPage([
      localStorage[currentCollection].vidIds[i],
      localStorage[currentCollection].vidSources[i],
      "storage",
      localStorage[currentCollection].vidSite[i],
      localStorage[currentCollection].vidURL[i],
    ]);
  }
};

const multiSelect = (e) => {
  let parent = e.target.parentNode.parentNode;
  let target = e.target;

  //add clicked video to selectedVids array
  if (!selectedVids.includes(parent.childNodes[1].childNodes[1].innerText)) {
    currentlySelecting = true;
    selectedVids.push(parent.childNodes[1].childNodes[1].innerText);
    parent.classList.toggle("entry-holder-multi-selected");
    target.classList.toggle("multi-select-btn-activated");
    target.parentNode.children[0].classList.toggle("btn-disabled");
    target.parentNode.children[1].classList.toggle("btn-disabled");
  } else {
    selectedVids.splice(
      selectedVids.indexOf(parent.childNodes[1].childNodes[1].innerText)
    );
    parent.classList.toggle("entry-holder-multi-selected");
    target.classList.toggle("multi-select-btn-activated");
    target.parentNode.children[0].classList.toggle("btn-disabled");
    target.parentNode.children[1].classList.toggle("btn-disabled");
    if (selectedVids.length == 0) {
      currentlySelecting = false;
    }
  }

  if (currentlySelecting) {
    document.getElementsByClassName("multi-select-options")[0].style.display =
      "flex";

    document.getElementsByClassName(
      "multi-select-vid-counter"
    )[0].innerText = `${selectedVids.length}`;
    document
      .getElementsByClassName("multi-select-vid-unselect-btn")[0]
      .addEventListener("click", () => {
        [
          ...document.getElementsByClassName("vid-container")[0].children,
        ].forEach((vid) => {
          if ([...vid.classList].includes("entry-holder-multi-selected")) {
            vid.classList.toggle("entry-holder-multi-selected");
          }
          if (
            [...vid.children[2].children[2].classList].includes(
              "multi-select-btn-activated"
            )
          ) {
            vid.children[2].children[2].classList.toggle(
              "multi-select-btn-activated"
            );
          }
        });
        selectedVids = [];
        document.getElementsByClassName(
          "multi-select-options"
        )[0].style.display = "none";
        target.parentNode.children[0].classList.toggle("btn-disabled");
        target.parentNode.children[1].classList.toggle("btn-disabled");
      });
    document
      .getElementsByClassName("multi-select-vid-delete-btn")[0]
      .addEventListener("click", () => {
        for (let i = 0; i < selectedVids.length; i++) {
          deleteVidFromCollection([selectedVids[i]]);
        }
        [
          ...document.getElementsByClassName("vid-container")[0].children,
        ].forEach((vid) => {
          if ([...vid.classList].includes("entry-holder-multi-selected")) {
            vid.classList.toggle("entry-holder-multi-selected");
          }
          if (
            [...vid.children[2].children[2].classList].includes(
              "multi-select-btn-activated"
            )
          ) {
            vid.children[2].children[2].classList.toggle(
              "multi-select-btn-activated"
            );
          }
        });
        selectedVids = [];
        document.getElementsByClassName(
          "multi-select-options"
        )[0].style.display = "none";
      });
    document
      .getElementsByClassName("multi-select-vid-copy-btn")[0]
      .addEventListener("click", (e) => {
        vidsToDeleteOrCopy = selectedVids;
        document.getElementsByClassName(
          "copy-or-move-internal"
        )[0].style.top = `${window.scrollY + window.innerHeight / 2}px`;
        document.getElementsByClassName("copy-or-move")[0].style.display =
          "block";
      });
  } else {
    document.getElementsByClassName("multi-select-options")[0].style.display =
      "none";
  }
};

const addVidsToPage = (vidInfo) => {
  const container = document.getElementsByClassName("vid-container")[0];

  if (vidInfo == undefined) {
    return;
  }

  //entry holder
  let newEntryHolder = elementCreator("div", ["entry-holder", `${vidInfo[0]}`]);
  newEntryHolder.draggable = "true";
  newEntryHolder.addEventListener("dragstart", (e) => {
    dragStart(e);
  });
  newEntryHolder.addEventListener("drag", (e) => {
    drag(e);
  });
  newEntryHolder.addEventListener("dragend", (e) => {
    dragEnd(e);
  });

  container.appendChild(newEntryHolder);

  //check if the file is from artgrid, if so then replace video with image

  if (vidInfo[1].includes("artgrid")) {
    //create new image element and set source to src
    let newVid = elementCreator("img", ["vid-mini"]);
    newVid.draggable = false;
    newVid.src = vidInfo[1];
    newEntryHolder.appendChild(newVid);
  } else {
    //create new video element and set source to src
    let newVid = elementCreator("video", ["vid-mini"]);
    newVid.controls = true;
    newVid.src = vidInfo[1];
    newEntryHolder.appendChild(newVid);
  }

  //set message with ID in it
  let newMessageId = elementCreator("div", ["vid-id"]);
  newMessageId.draggable = false;
  newMessageId.innerText = `${vidInfo[3]} ID: `;
  let newLink = elementCreator("a", ["vid-link"]);
  newLink.innerText = `${vidInfo[0]}`;
  newLink.href = vidInfo[4];
  newLink.draggable = false;
  newLink.target = "_blank";
  newMessageId.append(newLink);
  // newMessageId.innerText = `${vidInfo[3]} Video ID: ${vidInfo[0]}`;
  newEntryHolder.appendChild(newMessageId);

  let newBtnHolder = elementCreator("div", ["btn-container"]);
  newEntryHolder.appendChild(newBtnHolder);
  if (vidInfo[2] == "storage") {
    //add trash can button
    let newCheckmarkBtn = elementCreator("img", ["vid-delete-btn"]);
    newCheckmarkBtn.src = "assets/delete.png";
    newBtnHolder.appendChild(newCheckmarkBtn);
    newCheckmarkBtn.addEventListener("mousedown", () => {
      deleteVidFromCollection(vidInfo);
    });

    //add copy or move button
    let newCopyBtn = elementCreator("img", ["vid-copy-btn"]);
    newCopyBtn.src = "assets/copy.png";
    newBtnHolder.appendChild(newCopyBtn);
    newCopyBtn.addEventListener("mousedown", (e) => {
      vidsToDeleteOrCopy.push(e.target.parentNode.parentNode.classList[1]);
      document.getElementsByClassName(
        "copy-or-move-internal"
      )[0].style.top = `${window.scrollY + window.innerHeight / 2}px`;
      document.getElementsByClassName("copy-or-move")[0].style.display =
        "block";
    });

    //add multi-select button
    let newMultiSelectBtn = elementCreator("div", ["multi-select-btn"]);
    newBtnHolder.appendChild(newMultiSelectBtn);
    newMultiSelectBtn.addEventListener("mousedown", (e) => {
      multiSelect(e);
    });
  }
  if (vidInfo[2] == "new") {
    //add check mark button
    let newCheckmarkBtn = elementCreator("img", ["vid-checkmark-btn"]);
    newCheckmarkBtn.src = "assets/save.png";
    newEntryHolder.appendChild(newCheckmarkBtn);
    newCheckmarkBtn.addEventListener("mousedown", () => {
      addVidToCollection(vidInfo[0], vidInfo[1], vidInfo[3], vidInfo[4]);
    });
  }
};

const addVidToCollection = async (id, src, site, url) => {
  if (localStorage[currentCollection].vidIds.includes(id)) {
    alert("That video is already in the collection!");
    return;
  }
  console.log(id, src, site, url);
  if (currentCollection === undefined || currentCollection === "") {
    alert("No collection created");
    return;
  }
  localStorage[currentCollection].vidIds.push(id);
  localStorage[currentCollection].vidSources.push(src);
  localStorage[currentCollection].vidSite.push(site);
  localStorage[currentCollection].vidURL.push(url);
  await chrome.storage.local.set(localStorage).then(deleteAllVids());
};

const deleteVidFromCollection = async (vidInfo) => {
  let curVidIndex = localStorage[currentCollection].vidIds.indexOf(
    `${vidInfo[0]}`
  );
  localStorage[currentCollection].vidIds.splice(curVidIndex, 1);
  localStorage[currentCollection].vidSources.splice(curVidIndex, 1);
  localStorage[currentCollection].vidSite.splice(curVidIndex, 1);
  localStorage[currentCollection].vidURL.splice(curVidIndex, 1);

  await chrome.storage.local.set(localStorage);

  document
    .getElementsByClassName("vid-container")[0]
    .removeChild(document.getElementsByClassName(`${vidInfo[0]}`)[0]);
};

const copyVidToCollection = async (targetCollection) => {
  for (let i = 0; i < vidsToDeleteOrCopy.length; i++) {
    let index = localStorage[currentCollection].vidIds.indexOf(
      vidsToDeleteOrCopy[i]
    );
    let vidInfo = [
      localStorage[currentCollection].vidIds[index],
      localStorage[currentCollection].vidSite[index],
      localStorage[currentCollection].vidSources[index],
      localStorage[currentCollection].vidURL[index],
    ];

    console.log("copy to", targetCollection, vidInfo);

    localStorage[targetCollection].vidIds.push(vidInfo[0]);
    localStorage[targetCollection].vidSite.push(vidInfo[1]);
    localStorage[targetCollection].vidSources.push(vidInfo[2]);
    localStorage[targetCollection].vidURL.push(vidInfo[3]);
    chrome.storage.local.set(localStorage);
  }
  vidsToDeleteOrCopy = [];
  if (selectedVids.length >= 1) {
    {
      [...document.getElementsByClassName("vid-container")[0].children].forEach(
        (vid) => {
          if ([...vid.classList].includes("entry-holder-multi-selected")) {
            vid.classList.toggle("entry-holder-multi-selected");
          }
          if (
            [...vid.children[2].children[2].classList].includes(
              "multi-select-btn-activated"
            )
          ) {
            vid.children[2].children[2].classList.toggle(
              "multi-select-btn-activated"
            );
          }
        }
      );
      selectedVids = [];
      document.getElementsByClassName("multi-select-options")[0].style.display =
        "none";
      target.parentNode.children[0].classList.toggle("btn-disabled");
      target.parentNode.children[1].classList.toggle("btn-disabled");
    }
  }
};

const deleteAllVids = async () => {
  while (document.getElementsByClassName("vid-container")[0].firstChild) {
    document
      .getElementsByClassName("vid-container")[0]
      .removeChild(
        document.getElementsByClassName("vid-container")[0].firstChild
      );
  }
};

const elementCreator = (elem, elemClass) => {
  let newElem = document.createElement(`${elem}`);
  for (let i = 0; i < elemClass.length; i++) {
    if (i == 0) {
      newElem.setAttribute("class", elemClass[0]);
    } else {
      newElem.classList.add(`${elemClass[i]}`);
    }
  }
  return newElem;
};
