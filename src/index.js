import { h, diff, patch } from "virtual-dom";
import createElement from "virtual-dom/create-element";

const div = (props, children) => h("div", props, children);
const button = (props, children) => h("button", props, children);
const p = (props, children) => h("p", props, children);
const h1 = (props, children) => h("h1", props, children);
const input = (props) => h("input", props);

const btnStyle = "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded";

const MSGS = {
  INPUT_CHANGE_CALORIES: "INPUT_CHANGE_CALORIES",
  INPUT_CHANGE_FOOD: "INPUT_CHANGE_FOOD",
  ADD_ENTRY: "ADD_ENTRY",
  SEND_ENTRY: "SEND_ENTRY",
  CANCEL_ENTRY: "CANCEL_ENTRY",
  DELETE_ENTRY: "DELETE_ENTRY",
  DELETE_ALL_ENTRIES: "DELETE_ALL_ENTRIES", 
};

function view(dispatch, model) {
  const totalCalories = model.entries.reduce((total, entry) => total + parseInt(entry.calories), 0);

  return div({ className: "flex gap-4 flex-col items-center" }, [
    h1({ className: "text-2xl" }, `Weahter application:`),

    div({ className: "flex gap-4 items-center" }, [
      input({
        className: "border p-2", 
       
        oninput: (event) => dispatch({ type: MSGS.INPUT_CHANGE_FOOD, data: event.target.value }),
        onkeydown: (event) => {
          if (event.key === "Enter") {
            dispatch({ type: MSGS.ADD_ENTRY });
          }
        },
        value: model.inputFood,
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

    div({ className: "flex flex-col mt-4" },
      model.entries.map((entry, index) => div({ className: "flex items-center gap-2" }, [
        p({}, `Eintrag ${index + 1}: ${entry.calories} kcal - ${entry.food}`),
        button(
          { className: `${btnStyle} bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded`, onclick: () => dispatch({ type: MSGS.DELETE_ENTRY, index }) },
          "Delete"
        ),
      ]))
    ),

    button(
      { className: `${btnStyle} bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded`, onclick: () => dispatch({ type: MSGS.DELETE_ALL_ENTRIES }) }, 
      "Delete All"
    ),
  ]);
}

function update(msg, model) {
  switch (msg.type) {
    case MSGS.INPUT_CHANGE_CALORIES:
      return { ...model, inputCalories: msg.data };

    case MSGS.INPUT_CHANGE_FOOD:
      return { ...model, inputFood: msg.data };

    case MSGS.ADD_ENTRY:
      return {
        ...model,
        inputCalories: "",
        inputFood: "",
        entries: [
          ...model.entries,
          { calories: model.inputCalories, food: model.inputFood },
        ],
      };

    case MSGS.SEND_ENTRY:
      if (model.inputCalories !== "" && model.inputFood !== "") {
        return {
          ...model,
          inputCalories: "",
          inputFood: "",
          entries: [
            ...model.entries,
            { calories: model.inputCalories, food: model.inputFood },
          ],
        };
      } else {
        return model;
      }

    case MSGS.CANCEL_ENTRY:
      return {
        ...model,
        inputCalories: "",
        inputFood: "",
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
  inputCalories: "",
  inputFood: "",
  entries: [],
};

const rootNode = document.getElementById("app");
app(initModel, update, view, rootNode);
