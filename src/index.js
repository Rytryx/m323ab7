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
  WEATHER_DATA_RECEIVED: "WEATHER_DATA_RECEIVED",
};

const APIKEY = "4d017dea7a54f398446910f9172f057e";

const makeOpenWeatherAPICall = async (location, dispatch) => {
  const URL = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${APIKEY}&units=metric`;
  try {
    const response = await fetch(URL);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    dispatch({ type: MSGS.WEATHER_DATA_RECEIVED, data });
  } catch (error) {
    console.error('Error fetching weather data:', error);
  }
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
            makeOpenWeatherAPICall(model.inputCity, dispatch);
          }
        },
        value: model.inputCity,
        placeholder: "Enter city...",
      }),

      button(
        { className: `${btnStyle} bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded`, onclick: () => {
          makeOpenWeatherAPICall(model.inputCity, dispatch);
        } },
        "Add"
      ),

      button(
        { className: `${btnStyle} bg-red-500 hover.bg-red-600 text-white font-bold py-2 px-4 rounded`, onclick: () => dispatch({ type: MSGS.CANCEL_ENTRY }) },
        "Cancel"
      ),
    ]),

    table({ className: "mt-4 gap-4" }, [
      thead({}, [
        tr({}, [
          th({ className: "px-4 py-2 text-left" }, "City"),
          th({ className: "px-4 py-2" }, "Temperature (°C)"),
          th({ className: "px-4 py-2" }, "Min Temperature (°C)"),
          th({ className: "px-4 py-2" }, "Max Temperature (°C)"),
        ]),
      ]),
      tbody({}, model.entries.map((entry, index) => tr({}, [
        td({ className: "border px-4 py-2 text-left" }, entry.city),
        td({ className: "border px-4 py-2" }, entry.currentTemperature),
        td({ className: "border px-4 py-2" }, entry.minTemperature),
        td({ className: "border px-4 py-2" }, entry.maxTemperature),
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
        makeOpenWeatherAPICall(model.inputCity, dispatch);
        return { ...model, inputCity: "" };
      } else {
        return model;
      }

    case MSGS.WEATHER_DATA_RECEIVED:
      if (msg.data.main) {
        const newEntry = {
          city: msg.data.name, 
          currentTemperature: msg.data.main.temp,
          minTemperature: msg.data.main.temp_min,
          maxTemperature: msg.data.main.temp_max,
        };
        return {
          ...model,
          inputCity: "",
          entries: [...model.entries, newEntry],
        };
      } else {
        console.error('Weather data not available for the specified city.');
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
