import { h, diff, patch } from "virtual-dom";
import createElement from "virtual-dom/create-element";

const div = (props, children) => h("div", props, children);
const button = (props, children) => h("button", props, children);
const p = (props, children) => h("p", props, children);
const h1 = (props, children) => h("h1", props, children);
const input = (props) => h("input", props);
const table = (props, children) => h("table", props, children);
const thead = (props, children) => h("thead", props, children);
const tbody = (props, children) => h("tbody", props, children);
const tr = (props, children) => h("tr", props, children);
const th = (props, children) => h("th", props, children);
const td = (props, children) => h("td", props, children);

const btnStyle = "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded";

const MSGS = {
  INPUT_SELECT_CITY: "INPUT_SELECT_CITY",
  ADD_ENTRY: "ADD_ENTRY",
  SEND_ENTRY: "SEND_ENTRY",
  CANCEL_ENTRY: "CANCEL_ENTRY",
  DELETE_ENTRY: "DELETE_ENTRY",
  DELETE_ALL_ENTRIES: "DELETE_ALL_ENTRIES", 
};

function view(dispatch, model) {
  return div({ className: "flex gap-4 flex-col items-center" }, [
    h1({ className: "text-2xl" }, `Weather Application:`),

    div({ className: "flex gap-4 items-center" }, [
      input({
        className: "border p-2",
        oninput: (event) => dispatch({ type: MSGS.INPUT_SELECT_CITY, data: event.target.value }),
        onkeydown: (event) => {
          if (event.key === "Enter") {
            dispatch({ type: MSGS.ADD_ENTRY });
          }
        },
        value: model.inputCity,
        placeholder: "Enter city...",
      }),

      button(
        { className: `${btnStyle} bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded`, onclick: () => dispatch({ type: MSGS.SEND_ENTRY }) },
        "Add"
      ),

      button(
        { className: `${btnStyle} bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded`, onclick: () => dispatch({ type: MSGS.CANCEL_ENTRY }) },
        "Cancel"
      ),
    ]),

    table({ className: "mt-4 gap-4" }, [
      thead({}, [
        tr({}, [
          th({}, "City"),
          th({}, "Current Temperature"),
          th({}, "Min Temperature"),
          th({}, "Max Temperature"),
        ]),
      ]),
      tbody({}, model.entries.map((entry, index) => tr({}, [
        td({}, entry.city),
        td({}, entry.currentTemperature),
        td({}, entry.minTemperature),
        td({}, entry.maxTemperature),
      ]))),
    ]),

    button(
      { className: `${btnStyle} bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded`, onclick: () => dispatch({ type: MSGS.DELETE_ALL_ENTRIES }) },
      "Delete All"
    ),
  ]);
}

function update(msg, model) {
  switch (msg.type) {
    case MSGS.INPUT_SELECT_CITY:
      return { ...model, inputCity: msg.data };

    case MSGS.ADD_ENTRY:
      if (model.inputCity !== "") {
        // Hier fügen wir Testdaten basierend auf der eingegebenen Stadt hinzu
        const testEntry = {
          city: model.inputCity,
          currentTemperature: "N/A",
          minTemperature: "N/A",
          maxTemperature: "N/A",
        };

        return {
          ...model,
          inputCity: "",
          entries: [...model.entries, testEntry],
        };
      } else {
        return model;
      }

    case MSGS.SEND_ENTRY:
      if (model.inputCity !== "") {
        // Hier fügen wir Testdaten basierend auf der eingegebenen Stadt hinzu
        const testEntry = {
          city: model.inputCity,
          currentTemperature: "N/A",
          minTemperature: "N/A",
          maxTemperature: "N/A",
        };

        return {
          ...model,
          inputCity: "",
          entries: [...model.entries, testEntry],
        };
      } else {
        return model;
      }

    case MSGS.CANCEL_ENTRY:
      return {
        ...model,
        inputCity: "",
      };

    case MSGS.DELETE_ENTRY:
      if (model.entries.length > msg.index) {
        const updatedEntries = [...model.entries];
        updatedEntries.splice(msg.index, 1);
        return { ...model, entries: updatedEntries };
      } else {
        return model;
      }

    case MSGS.DELETE_ALL_ENTRIES:
      return { ...model, entries: [] };

    default:
      return model;
  }
}


function app(initModel, update, view, node) {
  let model = initModel;
  let currentView = view(dispatch, model);
  let rootNode = createElement(currentView);
  node.appendChild(rootNode);

  function dispatch(msg) {
    model = update(msg, model);
    const updatedView = view(dispatch, model);
    const patches = diff(currentView, updatedView);
    rootNode = patch(rootNode, patches);
    currentView = updatedView;
  }
}

const initModel = {
  inputCity: "",
  entries: [],
};

const rootNode = document.getElementById("app");
app(initModel, update, view, rootNode);
